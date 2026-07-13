"use client";

import { create } from "zustand";
import type { SessionUser, Role } from "@/types/session";

// NOT persisted — mirrors the legacy `State.user` which lives in memory only
// and clears on refresh/idle-lock (app/app.js:1183-1197, 2116+).
interface SessionStore {
  user: SessionUser | null;
  selectedRole: Role | null;
  ptFilter: string;
  profTab: string;

  setUser: (u: SessionUser | null) => void;
  setSelectedRole: (r: Role | null) => void;
  setPtFilter: (v: string) => void;
  setProfTab: (v: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionStore>()((set) => ({
  user: null,
  selectedRole: null,
  ptFilter: "",
  profTab: "info",

  setUser: (u) => set({ user: u }),
  setSelectedRole: (r) => set({ selectedRole: r }),
  setPtFilter: (v) => set({ ptFilter: v }),
  setProfTab: (v) => set({ profTab: v }),
  logout: () => set({ user: null, selectedRole: null }),
}));
