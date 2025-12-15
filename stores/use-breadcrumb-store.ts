import { create } from 'zustand'

interface BreadcrumbState {
  labels: Record<string, string>
  setLabel: (segment: string, label: string) => void
  reset: () => void
}

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  labels: {},
  setLabel: (segment, label) => set((state) => ({ labels: { ...state.labels, [segment]: label } })),
  reset: () => set({ labels: {} }),
}))
