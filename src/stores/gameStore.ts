import { create } from "zustand";

interface GameStore {
  gameRunning: boolean;
  gameTime: number;
  isLoggingIn: boolean;
  setGameRunning: (running: boolean) => void;
  setGameTime: (time: number) => void;
  incrementGameTime: () => void;
  setIsLoggingIn: (logging: boolean) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameRunning: false,
  gameTime: 0,
  isLoggingIn: false,
  setGameRunning: (gameRunning) => set({ gameRunning }),
  setGameTime: (gameTime) => set({ gameTime }),
  incrementGameTime: () => set((state) => ({ gameTime: state.gameTime + 1 })),
  setIsLoggingIn: (isLoggingIn) => set({ isLoggingIn }),
  reset: () => set({ gameRunning: false, gameTime: 0, isLoggingIn: false }),
}));
