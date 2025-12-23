// FILE: /context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, isFirebaseClientConfigured } from "../utils/firebaseClient";

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

  const firebaseConfigMissing = useMemo(() => {
    // Client-only check. On SSR it will be false, then re-evaluated in browser.
    if (typeof window === "undefined") return false;
    return !isFirebaseClientConfigured();
  }, []);

  const firebaseReady = useMemo(() => {
    if (typeof window === "undefined") return false;
    return isFirebaseClientConfigured();
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
    const db = getFirebaseDb();

    if (!auth || !db) {
      throw new Error("Firebase is not configured. Please set NEXT_PUBLIC_FIREBASE_* in Vercel.");
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    const userRef = doc(db, "users", cred.user.uid);
    await setDoc(
      userRef,
      {
        email,
        displayName: displayName || "",
        createdAt: new Date().toISOString(),
        subscriptionStatus: "none",
        plan: null,
      },
      { merge: true }
    );
  };

  const login: AuthContextValue["login"] = async (email, password) => {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error("Firebase is not configured. Please set NEXT_PUBLIC_FIREBASE_* in Vercel.");
    }
    await signInWithEmailAndPassword(auth, email, password);
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
