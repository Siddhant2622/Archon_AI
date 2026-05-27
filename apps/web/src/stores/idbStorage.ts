import { StateStorage } from 'zustand/middleware';
import * as idb from 'idb-keyval';

export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    try {
      const value = await idb.get(name);
      return value || null;
    } catch (e) {
      console.error('Failed to get from idb', e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    try {
      await idb.set(name, value);
    } catch (e) {
      console.error('Failed to set in idb', e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    try {
      await idb.del(name);
    } catch (e) {
      console.error('Failed to remove from idb', e);
    }
  },
};
