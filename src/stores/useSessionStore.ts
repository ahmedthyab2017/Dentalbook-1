"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SessionUser, Role } from "@/types/session";

interface SessionStore {
  user: SessionUser | null;
  selectedRole: Role | null;
  ptFilter: string;
  profTab: string;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  setUser: (u: SessionUser | null) => void;
  setSelectedRole: (r: Role | null) => void;
  setPtFilter: (v: string) => void;
  setProfTab: (v: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      user: null,
      selectedRole: null,
      ptFilter: "",
      profTab: "info",
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      setUser: (u) => set({ user: u }),
      setSelectedRole: (r) => set({ selectedRole: r }),
      setPtFilter: (v) => set({ ptFilter: v }),
      setProfTab: (v) => set({ profTab: v }),
      logout: () => set({ user: null, selectedRole: null }),
    }),
    {
      name: "dentalbook-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ user: s.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
