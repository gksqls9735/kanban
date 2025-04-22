import { create } from "zustand";
import { Task } from "../types/type";

interface TaskState {
  allTasks: Task[];
  setTasks: (tasks: Task[]) => void;
  updateTask: (taskId: string, updated: Partial<Task>) => void;
}

const useTaskStore = create<TaskState>((set, get) => ({
  allTasks: [],
  setTasks: (tasks: Task[]) => set({ allTasks: tasks }),
  updateTask: (taskId: string, updated: Partial<Task>) =>
    set((state) => {
      const newTasks = state.allTasks.map(t => (
        t.taskId === taskId ? { ...t, ...updated } : t
      ));

      return {
        allTasks: newTasks
      };
    }),
}));

export default useTaskStore;

