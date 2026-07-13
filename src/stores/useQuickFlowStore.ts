"use client";

import { create } from "zustand";

interface QuickFlowStore {
  open: boolean;
  presetPtId: string | null;
  presetPtName: string | null;
  openWithPatient: (ptId: string, ptName: string) => void;
  openBlank: () => void;
  close: () => void;
}

export const useQuickFlowStore = create<QuickFlowStore>((set) => ({
  open: false,
  presetPtId: null,
  presetPtName: null,
  openWithPatient: (ptId, ptName) => set({ open: true, presetPtId: ptId, presetPtName: ptName }),
  openBlank: () => set({ open: true, presetPtId: null, presetPtName: null }),
  close: () => set({ open: false, presetPtId: null, presetPtName: null }),
}));
