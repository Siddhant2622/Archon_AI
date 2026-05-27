import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './idbStorage';

const defaultCode = `export class UserService {
  private users: Map<string, User> = new Map();

  /**
   * Create a new user with validation
   */
  async createUser(data: CreateUserInput): Promise<User> {
    if (!data.email || !data.name) {
      throw new Error('Email and name are required');
    }

    const user: User = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email.toLowerCase(),
      role: data.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.id, user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    
    const updated = { ...user, ...data, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async listUsers(filter?: { role?: string }): Promise<User[]> {
    let users = Array.from(this.users.values());
    if (filter?.role) {
      users = users.filter(u => u.role === filter.role);
    }
    return users;
  }
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserInput {
  name: string;
  email: string;
  role?: string;
}`;

interface DocsState {
  code: string;
  mode: "snippet" | "repo";
  repoUrl: string;
  language: string;
  docs: string | null;
  repoInfo: any | null;
  setCode: (code: string) => void;
  setMode: (mode: "snippet" | "repo") => void;
  setRepoUrl: (url: string) => void;
  setLanguage: (lang: string) => void;
  setDocs: (docs: string | null) => void;
  setRepoInfo: (info: any | null) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useDocsStore = create<DocsState>()(
  persist(
    (set) => ({
      code: defaultCode,
      mode: "repo",
      repoUrl: "",
      language: "TypeScript",
      docs: null,
      repoInfo: null,
      setCode: (code) => set({ code }),
      setMode: (mode) => set({ mode }),
      setRepoUrl: (repoUrl) => set({ repoUrl }),
      setLanguage: (language) => set({ language }),
      setDocs: (docs) => set({ docs }),
      setRepoInfo: (repoInfo) => set({ repoInfo }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'archon-docs-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ 
        code: state.code, 
        mode: state.mode, 
        repoUrl: state.repoUrl, 
        language: state.language, 
        docs: state.docs, 
        repoInfo: state.repoInfo 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
