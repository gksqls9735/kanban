import { create } from "zustand";
import { SelectOption } from "../types/type";

interface StatusesState {
  statusList: SelectOption[];
  setStatusList: (list: SelectOption[]) => void;
  deleteStatus: (statusCode: string) => void;
}

const useStatusesStore = create<StatusesState>((set, get) => ({
  statusList: [],
  setStatusList: (list: SelectOption[]) => set({ statusList: list }),
  deleteStatus: (statusCode: string) => set((state) => {
    const newStatusList = state.statusList.filter(s => s.code !== statusCode);
    return { statusList: newStatusList };
  })
}));

export default useStatusesStore;