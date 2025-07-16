import { create } from "zustand";
import { ViewModes } from "../constant/constants";

interface ViewModeState {
  viewMode: string;
  setViewMode: (newMode: string) => void;
}

const useViewModeStore = create<ViewModeState>((set) => ({
  viewMode: ViewModes.STATUS,
  setViewMode: (newMode: string) => set({ viewMode: newMode }),
}));

export default useViewModeStore;