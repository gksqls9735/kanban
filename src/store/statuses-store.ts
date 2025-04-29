import { create } from "zustand";
import { SelectOption } from "../types/type";

interface StatusesState {
  statusList: SelectOption[];
  setStatusList: (list: SelectOption[]) => void;
  deleteStatus: (statusCode: string) => void;
  addStatus: (statusName: string) => void;
}

const useStatusesStore = create<StatusesState>((set, get) => ({
  statusList: [],
  setStatusList: (list: SelectOption[]) => set({ statusList: list }),
  deleteStatus: (statusCode: string) => set((state) => {
    const newStatusList = state.statusList.filter(s => s.code !== statusCode);
    return { statusList: newStatusList };
  }),
  addStatus: (statusName: string) => set((state) => {
    const newStatus: SelectOption = {
      code: `status-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      colorMain: '#b3b3b3',
      colorSub: '#edf0f5',
      name: statusName,
    }
    return { statusList: [...state.statusList, newStatus] };
  }),
}));

export default useStatusesStore;