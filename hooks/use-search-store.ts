import { create } from 'zustand'

interface SearchStore {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  toggle: () => void
  setOpen: (open: boolean) => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
}))
