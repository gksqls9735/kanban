import { create } from "zustand";
import { Section } from "../types/type";
import { generateUniqueId } from "../utils/text-function";

interface SectionsState {
  sections: Section[];
  setSections: (list: Section[]) => void;
  addSection: (sectionName: string, ganttMode?: boolean) => void;
  insertSection: (referenceSectionId: string, position: 'before' | 'after') => void;
  updateSection: (sectionId: string, updated: Partial<Section>) => void;
  deleteSection: (sectionId: string) => void;
}

const useSectionsStore = create<SectionsState>((set, _get) => ({
  sections: [],
  
  setSections: (list: Section[]) => set({ sections: list }),

  addSection: (sectionName: string, ganttMode: boolean = false) => set((state) => {
    const newSection: Section = {
      sectionId: generateUniqueId('section'),
      sectionName: sectionName,
      order: state.sections.length + 1,
      isOpen: ganttMode,
      isNew: ganttMode,
    }
    return { sections: [...state.sections, newSection] };
  }),

  insertSection: (referenceSectionId: string, position: 'before' | 'after') => set((state) => {
    const sections = state.sections;
    const targetIndex = sections.findIndex(sec => sec.sectionId === referenceSectionId);

    if (targetIndex === -1) {
      console.warn(`[insertSection] Reference section with id ${referenceSectionId} not found`);
      return {};
    }

    const newSection: Section = {
      sectionId: generateUniqueId('section'),
      sectionName: '제목 없는 섹션',
      order: 0,
    };

    const insertAtIndex = position === 'before' ? targetIndex : targetIndex + 1;

    const tempSections = [...sections];
    tempSections.splice(insertAtIndex, 0, newSection);

    const finalSections = tempSections.map((section, index) => ({
      ...section, order: index,
    }));

    return { sections: finalSections };
  }),

  updateSection: (sectionId: string, updated: Partial<Section>) => set((state) => {
    const updatedSections = state.sections.map(sec =>
      sec.sectionId === sectionId ? { ...sec, ...updated } : sec
    )
    return { sections: updatedSections }
  }),

  deleteSection: (sectionId: string) => set((state) => {
    const newSections = state.sections.filter(sec => sec.sectionId !== sectionId);
    return { sections: newSections };
  }),
}));

export default useSectionsStore;