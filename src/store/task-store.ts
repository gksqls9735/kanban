import { create } from "zustand";
import { Task } from "../types/type";

interface TaskState {
  allTasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (newTask: Task) => void;
  updateTask: (taskId: string, updated: Partial<Task>) => void;
  deletTask: (taskId: string) => void;
}

const useTaskStore = create<TaskState>((set, get) => ({
  allTasks: [],
  setTasks: (tasks: Task[]) => set({ allTasks: tasks }),
  addTask: (newTask: Task) => set((state) => {
    const newTasks = [...state.allTasks, newTask];
    return { allTasks: newTasks }
  }),
  updateTask: (taskId: string, updated: Partial<Task>) =>
    set((state) => {
      console.log(updated);
      const newTasks = state.allTasks.map(t => (
        t.taskId === taskId ? { ...t, ...updated } : t
      ));
      return {
        allTasks: newTasks
      };
    }),
  deletTask: (taskId: string) => set((state) => {
    const newList = state.allTasks.filter(t => t.taskId !== taskId);
    return { allTasks: newList };
  }),
}));

export default useTaskStore;

