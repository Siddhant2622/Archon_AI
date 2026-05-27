import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './idbStorage';

interface ArchitectureState {
  description: string;
  result: string | null;
  setDescription: (desc: string) => void;
  setResult: (res: string | null) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useArchitectureStore = create<ArchitectureState>()(
  persist(
    (set) => ({
      description: "An e-commerce platform with user authentication, product catalog, shopping cart, payment processing via Stripe, order management, email notifications, and an admin dashboard. It should handle 10K concurrent users and support real-time inventory updates.",
      result: null,
      setDescription: (desc) => set({ description: desc }),
      setResult: (res) => set({ result: res }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'archon-architecture-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ description: state.description, result: state.result }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    }
  )
);
