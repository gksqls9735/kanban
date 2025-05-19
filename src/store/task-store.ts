import { create } from "zustand";
import { Task } from "../types/type";
import { statusWaiting } from "../mocks/select-option-mock";

interface TaskState {
  allTasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (newTask: Task) => void;
  updateTask: (taskId: string, updated: Partial<Task>) => void;
  deletTask: (taskId: string) => void;
  copyTask: (originalTask: Task) => void;
  deleteTasksBySection: (sectionId: string) => void;
  updateTasksByStatus: (originalStatusCode: string) => void;
}

const useTaskStore = create<TaskState>((set, _get) => ({
  allTasks: [],
  setTasks: (tasks: Task[]) => set({ allTasks: tasks }),
  addTask: (newTask: Task) => set((state) => {
    const orderedTask = { ...newTask, order: state.allTasks.length + 1 };
    const newTasks = [...state.allTasks, orderedTask];
    return { allTasks: newTasks }
  }),
  updateTask: (taskId: string, updated: Partial<Task>) =>
    set((state) => {
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
  copyTask: (originalTask: Task) => set((state) => {
    const currentOriginalTask = state.allTasks.find(t => t.taskId === originalTask.taskId);
    if (!currentOriginalTask) return {};
    const originalOrder = currentOriginalTask.order ?? 0;

    let nextOrder: number;
    const sortedTasks = [...state.allTasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const originalIndex = sortedTasks.findIndex(t => t.taskId === originalTask.taskId);

    if (originalIndex + 1 < sortedTasks.length) {
      nextOrder = sortedTasks[originalIndex + 1].order ?? (originalOrder + 2);
    } else {
      nextOrder = originalOrder + 1;
    }
    const newOrder = (originalOrder + nextOrder) / 2;
    const copiedTask = { ...originalTask, taskId: `task-${Date.now()}-${Math.random().toString(36).substring(7)}`, order: newOrder };
    return { allTasks: [...state.allTasks, copiedTask] };
  }),
  deleteTasksBySection: (sectionId: string) => set((state) => {
    const remainingTasks = state.allTasks.filter(t => t.sectionId !== sectionId);
    return { allTasks: remainingTasks };
  }),
  updateTasksByStatus: (originalStatusCode: string) => set((state) => {
    const updatedTasks = state.allTasks.map(t =>
      t.status.code === originalStatusCode ? { ...t, status: statusWaiting } : t
    );

    return { allTasks: updatedTasks };
  }),
}));

export default useTaskStore;

