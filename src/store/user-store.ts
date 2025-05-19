import { create } from "zustand";
import { User } from "../types/type";

interface UserState {
  currentUser: User | undefined;
  userlist: User[];
  setCurrentUser: (user: User) => void;
  setUserlist: (userlist: User[]) => void;
}

const useUserStore = create<UserState>((set, _get) => ({
  currentUser: undefined,
  userlist: [],
  setCurrentUser: (user: User) => set({ currentUser: user }),
  setUserlist: (userlist: User[]) => set({ userlist }),
}));

export default useUserStore;