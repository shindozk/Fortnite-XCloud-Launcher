import { create } from "zustand";

export interface SessionStatus {
  is_logged_in: boolean;
  username: string | null;
}

interface SessionStore {
  session: SessionStatus;
  isLoading: boolean;
  setSession: (session: SessionStatus) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialSession: SessionStatus = {
  is_logged_in: false,
  username: null,
};

export const useSessionStore = create<SessionStore>((set) => ({
  session: initialSession,
  isLoading: true,
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ session: initialSession, isLoading: false }),
}));
