import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: any | null;
  token: string | null;
  setAuth: (user: any, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: "auth-storage",
      storage:
        typeof window !== "undefined"
          ? {
              getItem: (name: string) => {
                const item = localStorage.getItem(name);
                return item ? JSON.parse(item) : null;
              },
              setItem: (name: string, value: any) => {
                localStorage.setItem(name, JSON.stringify(value));
              },
              removeItem: (name: string) => {
                localStorage.removeItem(name);
              },
            }
          : undefined, // Ensure safe storage access
    }
  )
);

