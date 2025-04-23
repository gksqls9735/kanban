import { create } from "zustand";
import { SelectOption } from "../types/type";

interface StatusesState {
  statusList: SelectOption[];
  setStatusList: (list: SelectOption[]) => void;
}

const useStatusesStore = create<StatusesState>((set, get) => ({
  statusList: [],
  setStatusList: (list: SelectOption[]) => set({ statusList: list }),
}));

export default useStatusesStore;