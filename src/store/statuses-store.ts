import { create } from "zustand";
import { SelectOption } from "../types/type";

interface StatusesState {
  statusList: SelectOption[];
  setStatusList: (list: SelectOption[]) => void;
  addStatus: (statusName: string) => void;
  updateStatus: (statusCode: string, updated: Partial<SelectOption>) => void;
  deleteStatus: (statusCode: string) => void;
}

const useStatusesStore = create<StatusesState>((set, get) => ({
  statusList: [],
  setStatusList: (list: SelectOption[]) => set({ statusList: list }),
  addStatus: (statusName: string) => set((state) => {
    const newStatus: SelectOption = {
      code: `status-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      colorMain: '#b3b3b3',
      colorSub: '#edf0f5',
      name: statusName,
    }
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