import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FavoriteType = 'project' | 'country' | 'entity' | 'address';

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  title: string;
  subtitle?: string;
  metadata?: Record<string, any>;
  image?: string;
}

interface FavoritesState {
  items: FavoriteItem[];
  addItem: (item: FavoriteItem) => void;
  removeItem: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getItemsByType: (type: FavoriteType) => FavoriteItem[];
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        if (state.items.some((i) => i.id === item.id)) return state;
        return { items: [...state.items, item] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),
      isFavorite: (id) => get().items.some((i) => i.id === id),
      getItemsByType: (type) => get().items.filter((i) => i.type === type),
    }),
    {
      name: 'aseec-favorites-storage',
    }
  )
)
