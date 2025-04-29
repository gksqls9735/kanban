import { create } from "zustand";
import { SelectOption } from "../types/type";

interface StatusesState {
  statusList: SelectOption[];
  setStatusList: (list: SelectOption[]) => void;
  addStatus: (status: Partial<SelectOption>) => void;
  updateStatus: (statusCode: string, updated: Partial<SelectOption>) => void;
  deleteStatus: (statusCode: string) => void;
}

const useStatusesStore = create<StatusesState>((set, get) => ({
  statusList: [],
  setStatusList: (list: SelectOption[]) => set({ statusList: list }),
  addStatus: (status: Partial<SelectOption>) => set((state) => {
    const newStatus: SelectOption = {
      ...status,
      code: `status-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    } as SelectOption;
    return { statusList: [...state.statusList, newStatus] };
  }),
  updateStatus: (statusCode: string, updated: Partial<SelectOption>) => set((state) => {
    const updatedStatuses = state.statusList.map(s =>
      s.code === statusCode ? { ...s, updated } : s
    );
    return { statusList: updatedStatuses };
  }),
  deleteStatus: (statusCode: string) => set((state) => {
    const newStatusList = state.statusList.filter(s => s.code !== statusCode);
    return { statusList: newStatusList };
  }),
}));

export default useStatusesStore;