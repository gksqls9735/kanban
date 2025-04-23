import { create } from "zustand";
import { Section } from "../types/type";

interface SectionsState {
  sections: Section[];
  setSections: (list: Section[]) => void;
}

const useSectionsStore = create<SectionsState>((set, get) => ({
  sections: [],
  setSections: (list: Section[]) => set({ sections: list }),
}));

export default useSectionsStore;