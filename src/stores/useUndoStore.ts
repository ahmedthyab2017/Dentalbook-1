"use client";

import { create } from "zustand";
import type { DentistDb } from "@/types/db";

// In-memory only, last 10 snapshots — mirrors legacy UndoStack (app/app.js:1247-1281).
interface Snapshot {
  label?: string;
  ts: number;
  db: DentistDb;
}

interface UndoStore {
  stack: Snapshot[];
  push: (db: DentistDb, label?: string) => void;
  pop: () => Snapshot | undefined;
  canUndo: () => boolean;
}

const MAX = 10;

export const useUndoStore = create<UndoStore>()((set, get) => ({
  stack: [],
  push: (db, label) => {
    set((s) => {
      const snap: Snapshot = { label, ts: Date.now(), db };
      const next = [...s.stack, snap];
      if (next.length > MAX) next.shift();
      return { stack: next };
    });
  },
  pop: () => {
    const { stack } = get();
    if (stack.length === 0) return undefined;
    const last = stack[stack.length - 1];
    set({ stack: stack.slice(0, -1) });
    return last;
  },
  canUndo: () => get().stack.length > 0,
}));
