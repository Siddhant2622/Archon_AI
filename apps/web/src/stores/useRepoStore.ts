import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './idbStorage';

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  url: string;
  isPrivate: boolean;
  status?: 'idle' | 'indexing' | 'analyzing' | 'completed' | 'error';
  analysisResult?: any;
  errorMessage?: string;
}

interface RepoState {
  repos: Repository[];
  activeRepoFullName: string | null;
  addRepos: (repos: Repository[]) => void;
  removeRepo: (fullName: string) => void;
  setActiveRepo: (fullName: string | null) => void;
  updateRepoStatus: (fullName: string, status: Repository['status'], result?: any, errorMessage?: string) => void;
  getRepo: (fullName: string) => Repository | undefined;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useRepoStore = create<RepoState>()(
  persist(
    (set, get) => ({
      repos: [],
      activeRepoFullName: null,
      
      addRepos: (newRepos) => set((state) => {
        const existingFullNames = new Set(state.repos.map(r => r.fullName));
        const toAdd = newRepos.filter(r => !existingFullNames.has(r.fullName));
        return { repos: [...state.repos, ...toAdd] };
      }),
      
      removeRepo: (fullName) => set((state) => ({
        repos: state.repos.filter(r => r.fullName !== fullName),
        activeRepoFullName: state.activeRepoFullName === fullName ? null : state.activeRepoFullName
      })),
      
      setActiveRepo: (fullName) => set({ activeRepoFullName: fullName }),
      
      updateRepoStatus: (fullName, status, result, errorMessage) => set((state) => ({
        repos: state.repos.map(repo => 
          repo.fullName === fullName 
            ? { ...repo, status, ...(result ? { analysisResult: result } : {}), ...(errorMessage ? { errorMessage } : {}) } 
            : repo
        )
      })),
      
      getRepo: (fullName) => get().repos.find(r => r.fullName === fullName),
      
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'archon-repo-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ repos: state.repos, activeRepoFullName: state.activeRepoFullName }), // Persist these
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
