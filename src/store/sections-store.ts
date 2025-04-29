import { create } from "zustand";
import { Section } from "../types/type";

interface SectionsState {
  sections: Section[];
  setSections: (list: Section[]) => void;
  addSection: (sectionName: string) => void;
  updateSection: (sectionId: string, updated: Partial<Section>) => void;
  deleteSection: (sectionId: string) => void;
}

const useSectionsStore = create<SectionsState>((set, get) => ({
  sections: [],
  setSections: (list: Section[]) => set({ sections: list }),
  addSection: (sectionName: string) => set((state) => {
    const newSection: Section = {
      sectionId: `section-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      sectionName: sectionName,
      order: state.sections.length + 1,
    }

    return { sections: [...state.sections, newSection] };
  }),
  updateSection: (sectionId: string, updated: Partial<Section>) => set((state) => {
    console.log(sectionId);
    console.log(updated);
    const updatedSections = state.sections.map(sec =>
      sec.sectionId === sectionId ? { ...sec, updated } : sec
    )
    return {sections: updatedSections}
  }),
  deleteSection: (sectionId: string) => set((state) => {
    const newSections = state.sections.filter(sec => sec.sectionId !== sectionId);
    return { sections: newSections };
  }),
}));

export default useSectionsStore;