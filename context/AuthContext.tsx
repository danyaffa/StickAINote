// FILE: context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "../utils/firebaseClient";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  register: (params: {
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const register: AuthContextValue["register"] = async ({
    email,
    password,
    displayName
  }) => {
    const cred = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    // Create user doc with basic info and subscription placeholder
    const userRef = doc(firebaseDb, "users", cred.user.uid);
    await setDoc(
      userRef,
      {
        email,
        displayName: displayName || "",
        createdAt: new Date().toISOString(),
        subscriptionStatus: "none",
        plan: null
      },
      { merge: true }
    );
  };

  const login: AuthContextValue["login"] = async (email, password) => {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  };

  const logout = async () => {
    await signOut(firebaseAuth);
  };

  const value: AuthContextValue = {
    user,
    loading,
    register,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
