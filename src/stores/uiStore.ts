import { create } from "zustand";

interface UIStore {
  showSettings: boolean;
  showInfo: boolean;
  setShowSettings: (show: boolean) => void;
  setShowInfo: (show: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  showSettings: false,
  showInfo: false,
  setShowSettings: (showSettings) => set({ showSettings }),
  setShowInfo: (showInfo) => set({ showInfo }),
}));
