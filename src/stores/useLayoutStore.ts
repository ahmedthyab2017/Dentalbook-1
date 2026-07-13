"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutStore {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (v: boolean) => void;
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleMobileSidebar: () => set({ mobileSidebarOpen: !get().mobileSidebarOpen }),
      setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
    }),
    { name: "dantal_layout" }
  )
);
