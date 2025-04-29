import { create } from "zustand";
import { Section } from "../types/type";

interface SectionsState {
  sections: Section[];
  setSections: (list: Section[]) => void;
  deleteSection: (sectionId: string) => void;
}

const useSectionsStore = create<SectionsState>((set, get) => ({
  sections: [],
  setSections: (list: Section[]) => set({ sections: list }),
  deleteSection: (sectionId: string) => set((state) => {
    const newSections = state.sections.filter(sec => sec.sectionId !== sectionId);
    return { sections: newSections };
  }),
}));

export default useSectionsStore;