// FILE: /context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseClientConfigured } from "../utils/firebaseClient";
import { apiUrl } from "../lib/apiBase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  firebaseReady: boolean;
  firebaseConfigMissing: boolean;
  register: (params: { email: string; password: string; displayName?: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [firebaseConfigMissing, setFirebaseConfigMissing] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    const configured = isFirebaseClientConfigured();
    setFirebaseConfigMissing(!configured);
    setFirebaseReady(configured);
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();

    // If Firebase client isn't configured, do not crash the app.
    if (!auth) {
      setUser(null);
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const register: AuthContextValue["register"] = async ({ email, password, displayName }) => {
    const auth = getFirebaseAuth();

    if (!auth) {
      throw new Error("Firebase is not configured. Please set NEXT_PUBLIC_FIREBASE_* in Vercel.");
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    // Create user profile via server-side API (uses Firebase Admin to bypass Firestore rules).
    // If this fails we still let the user proceed – the account exists in Firebase Auth
    // and the profile can be created on next login.
    try {
      const idToken = await cred.user.getIdToken();
      const resp = await fetch(apiUrl("/api/create-user-profile"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email, displayName: displayName || "" }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        console.warn("Profile creation returned error (non-blocking):", data.error);
      }
    } catch (profileErr) {
      console.warn("Profile creation failed (non-blocking):", profileErr);
    }
  };

  const login: AuthContextValue["login"] = async (email, password) => {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error("Firebase is not configured. Please set NEXT_PUBLIC_FIREBASE_* in Vercel.");
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Ensure user profile exists (covers case where profile creation failed during registration)
    try {
      const idToken = await cred.user.getIdToken();
      await fetch(apiUrl("/api/create-user-profile"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email,
          displayName: cred.user.displayName || "",
        }),
      });
    } catch {
      // Non-blocking – profile may already exist or Admin SDK may be unavailable
    }
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signOut(auth);
  };

  const value: AuthContextValue = {
    user,
    loading,
    firebaseReady,
    firebaseConfigMissing,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
