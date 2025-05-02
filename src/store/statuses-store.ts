import { create } from "zustand";
import { SelectOption } from "../types/type";
import { generateUniqueId } from "../utils/text-function";

interface StatusesState {
  statusList: SelectOption[];
  setStatusList: (list: SelectOption[]) => void;
  addStatus: (status: Partial<SelectOption>) => void;
  insertStatus: (referenceCode: string, newStatus: SelectOption, position: 'before' | 'after') => void;
  updateStatus: (statusCode: string, updated: Partial<SelectOption>) => void;
  deleteStatus: (statusCode: string) => void;
}

const useStatusesStore = create<StatusesState>((set, get) => ({
  statusList: [],

  setStatusList: (list: SelectOption[]) => set({ statusList: list }),

  addStatus: (status: Partial<SelectOption>) => set((state) => {
    const newStatus: SelectOption = {
      ...status,
      code: generateUniqueId('status'),
    } as SelectOption;
    return { statusList: [...state.statusList, newStatus] };
  }),

  insertStatus: (referenceCode: string, newStatus: SelectOption, position: 'before' | 'after') => set((state) => {
    const statusList = state.statusList;
    const targetIndex = statusList.findIndex(s => s.code === referenceCode);

    if (targetIndex === -1) {
      console.warn(`[insertStatus] Reference status with code ${referenceCode} not found`);
      return {};
    }

    const insertAtIndex = position === 'before' ? targetIndex : targetIndex + 1;

    const finalStatusList = [...statusList];
    finalStatusList.splice(insertAtIndex, 0, newStatus);

    return { statusList: finalStatusList };
  }),

  updateStatus: (statusCode: string, updated: Partial<SelectOption>) => set((state) => {
    const updatedStatuses = state.statusList.map(s =>
      s.code === statusCode ? { ...s, ...updated } : s
    );
    return { statusList: updatedStatuses };
  }),

  deleteStatus: (statusCode: string) => set((state) => {
    const newStatusList = state.statusList.filter(s => s.code !== statusCode);
    return { statusList: newStatusList };
  }),
}));

export default useStatusesStore;