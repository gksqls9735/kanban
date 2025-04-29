import { create } from "zustand";
import { Section } from "../types/type";

interface SectionsState {
  sections: Section[];
  setSections: (list: Section[]) => void;
  deleteSection: (sectionId: string) => void;
  addSection: (sectionName: string) => void;
}

const useSectionsStore = create<SectionsState>((set, get) => ({
  sections: [],
  setSections: (list: Section[]) => set({ sections: list }),
  deleteSection: (sectionId: string) => set((state) => {
    const newSections = state.sections.filter(sec => sec.sectionId !== sectionId);
    return { sections: newSections };
  }),
  addSection: (sectionName: string) => set((state) => {
    const newSection: Section = {
      sectionId: `section-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      sectionName: sectionName,
      order: state.sections.length + 1,
    }

    return { sections: [...state.sections, newSection] };
  }),
}));

export default useSectionsStore;