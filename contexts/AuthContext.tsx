"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { signOut, onIdTokenChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export type TeamRole = "owner" | "collaborator" | "viewer";

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  sharedUserId: string;
  activeTeamId: string;
  teamRole: TeamRole;
}

interface AuthContextValue {
  user: AuthUser;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  user: initialUser,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser>(initialUser);

  // Keep the server-side session cookie in sync with Firebase's auto-refreshed tokens.
  // Firebase client SDK refreshes ID tokens every ~55 minutes; this listener
  // re-POSTs the fresh token to /api/auth so the cookie never goes stale.
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await fetch("/api/auth");
    const data = await res.json();
    if (data.authenticated) {
      setUser({
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        sharedUserId: data.sharedUserId,
        activeTeamId: data.activeTeamId,
        teamRole: data.teamRole,
      });
    }
  }, []);

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    await signOut(getFirebaseAuth());
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
