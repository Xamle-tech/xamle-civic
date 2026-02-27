import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PolicyStatus, PolicyTheme, SenegalRegion } from '@xamle/types';

interface FilterState {
  theme: PolicyTheme | undefined;
  status: PolicyStatus | undefined;
  ministryId: string | undefined;
  region: SenegalRegion | undefined;
  search: string;
  page: number;

  setTheme: (theme: PolicyTheme | undefined) => void;
  setStatus: (status: PolicyStatus | undefined) => void;
  setMinistryId: (id: string | undefined) => void;
  setRegion: (region: SenegalRegion | undefined) => void;
  setSearch: (q: string) => void;
  setPage: (page: number) => void;
  reset: () => void;
  toSearchParams: () => URLSearchParams;
}

const initialState = {
  theme: undefined,
  status: undefined,
  ministryId: undefined,
  region: undefined,
  search: '',
  page: 1,
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setTheme: (theme) => set({ theme, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setMinistryId: (ministryId) => set({ ministryId, page: 1 }),
      setRegion: (region) => set({ region, page: 1 }),
      setSearch: (search) => set({ search, page: 1 }),
      setPage: (page) => set({ page }),
      reset: () => set(initialState),
      toSearchParams: () => {
        const { theme, status, ministryId, region, search, page } = get();
        const params = new URLSearchParams();
        if (theme) params.append('theme', theme);
        if (status) params.append('status', status);
        if (ministryId) params.append('ministryId', ministryId);
        if (region) params.append('region', region);
        if (search) params.append('search', search);
        params.append('page', String(page));
        return params;
      },
    }),
    {
      name: 'xamle-filters',
      partialize: (state) => ({ theme: state.theme, status: state.status }),
    },
  ),
);
