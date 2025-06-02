import { create } from "zustand";
import { SelectOption, Task } from "../types/type";
import { statusWaiting } from "../mocks/select-option-mock";
import { generateUniqueId } from "../utils/text-function";
import { hasExistingDependencyPath, updateTaskAndSuccessors } from "../utils/gantt/dependencies-utlis";

// 간트 차트 전용 의존성 추가 관련
export type AddDependencyResult =
  | { success: true; message?: string }
  | { success: false; reason: 'tasks_not_found' | 'self_dependency' | 'already_exists' | 'cycle_detected' | 'skip_level_dependency' | 'unknown_error'; message: string };

interface TaskState {
  allTasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (newTask: Task) => void;
  updateTask: (taskId: string, updated: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  copyTask: (originalTask: Task) => void;
  deleteTasksBySection: (sectionId: string) => void;
  updateTasksByStatus: (originalStatusCode: string) => void;
  updateTasksWithNewStatusDetails: (newStatus: SelectOption) => void;

  // 간트 차트 전용
  addDependency: (endId: string, startId: string, isStartParent: boolean) => AddDependencyResult;
}

const useTaskStore = create<TaskState>((set, get) => ({
  allTasks: [],

  setTasks: (tasks: Task[]) => set({ allTasks: tasks }),

  addTask: (newTask: Task) => set((state) => {
    const orderedTask = { ...newTask, order: state.allTasks.length + 1 };
    const newTasks = [...state.allTasks, orderedTask];
    return { allTasks: newTasks }
  }),

  updateTask: (taskId: string, updated: Partial<Task>) =>
    set((state) => {
      const taskMap = new Map<string, Task>(
        state.allTasks.map(t => [t.taskId, {
          ...t,
          start: new Date(t.start),
          end: new Date(t.end),
          dependencies: [...(t.dependencies || [])],
        }])
      );

      const target = taskMap.get(taskId);
      if (!target) return {};

      const originalEnd = target.end.getTime();
      const updatedEnd = updated.end?.getTime();
      const endChanged = updatedEnd !== undefined && updatedEnd !== originalEnd;

      // task 업데이트
      const updatedTask = { ...target, ...updated };
      taskMap.set(taskId, updatedTask);

      if (endChanged) {
        const deltaMs = updatedTask.end.getTime() - originalEnd;

        const updateSuccessors = (currentId: string, delta: number) => {
          const currentTask = taskMap.get(currentId);
          if (!currentTask) return;

          const currentEnd = currentTask.end;

          const successors = Array.from(taskMap.values()).filter(t =>
            t.dependencies?.includes(currentId)
          );

          for (const succ of successors) {
            const oldStart = new Date(succ.start);
            const oldEnd = new Date(succ.end);
            const duration = oldEnd.getTime() - oldStart.getTime();

            // 기본적으로 기존 시간은 유지한 채 날짜만 delta 만큼 이동
            const shiftedStart = new Date(oldStart.getTime() + delta);
            //   const shiftedEnd = new Date(shiftedStart.getTime() + duration);

            // 만약 선행 작업 end보다 후행작업 start가 앞서면 → 날짜 보정
            if (shiftedStart < currentEnd) {
              shiftedStart.setFullYear(currentEnd.getFullYear());
              shiftedStart.setMonth(currentEnd.getMonth());
              shiftedStart.setDate(currentEnd.getDate());
            }

            // end는 항상 start + duration
            const newEnd = new Date(shiftedStart.getTime() + duration);

            succ.start = shiftedStart;
            succ.end = newEnd;

            taskMap.set(succ.taskId, succ);
            updateSuccessors(succ.taskId, delta);
          }
        };

        updateSuccessors(taskId, deltaMs);
      }

      return {
        allTasks: Array.from(taskMap.values()),
      };
    }),


  deleteTask: (taskId: string) => set((state) => {
    const newList = state.allTasks.filter(t => t.taskId !== taskId);

    const updatedList = newList.map(t => {
      if (t.dependencies && t.dependencies.includes(taskId)) {
        return { ...t, dependencies: t.dependencies.filter(depId => depId !== taskId) }
      }
      return t;
    });

    return { allTasks: updatedList };
  }),

  copyTask: (originalTask: Task) => set((state) => {
    const currentOriginalTask = state.allTasks.find(t => t.taskId === originalTask.taskId);
    if (!currentOriginalTask) return {};
    const originalOrder = currentOriginalTask.sectionOrder ?? 0;

    let nextOrder: number;
    const sortedTasks = [...state.allTasks].sort((a, b) => (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0));
    const originalIndex = sortedTasks.findIndex(t => t.taskId === originalTask.taskId);

    if (originalIndex + 1 < sortedTasks.length) {
      nextOrder = sortedTasks[originalIndex + 1].sectionOrder ?? (originalOrder + 2);
    } else {
      nextOrder = originalOrder + 1;
    }
    const newOrder = (originalOrder + nextOrder) / 2;
    const copiedTask = { ...originalTask, taskId: generateUniqueId('task'), order: newOrder };
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

  updateTasksWithNewStatusDetails: (newStatus: SelectOption) => set((state) => {
    const newTasks = state.allTasks.map(t =>
      newStatus.code === t.status.code ? { ...t, status: newStatus } : t
    );
    return { allTasks: newTasks };
  }),

  addDependency: (endId: string, startId: string, isStartParent: boolean): AddDependencyResult => {
    const state = get(); // 현재 상태를 가져옵니다.

    const childTaskId = isStartParent ? endId : startId;
    const newParentTaskId = isStartParent ? startId : endId;

    const childTaskFromState = state.allTasks.find(t => t.taskId === childTaskId);
    const newParentTaskFromState = state.allTasks.find(t => t.taskId === newParentTaskId);

    if (!childTaskFromState || !newParentTaskFromState) {
      return { success: false, reason: 'tasks_not_found', message: "연결할 작업을 찾을 수 없습니다." };
    }
    if (childTaskId === newParentTaskId) {
      return { success: false, reason: 'self_dependency', message: "자기 자신에게 의존성을 추가할 수 없습니다." };
    }

    const currentTaskMapForChecks = new Map<string, Task>(
      state.allTasks.map(t => [t.taskId, {
        ...t, start: new Date(t.start), end: new Date(t.end), dependencies: [...(t.dependencies || [])],
      }])
    );

    if ((childTaskFromState.dependencies ?? []).includes(newParentTaskId)) {
      return { success: false, reason: 'already_exists', message: "이미 존재하는 의존성입니다." };
    }

    if (hasExistingDependencyPath(newParentTaskId, childTaskId, currentTaskMapForChecks)) {
      return { success: false, reason: 'cycle_detected', message: "순환 의존성은 허용되지 않습니다." };
    }

    const childsCurrentDeps = childTaskFromState.dependencies ?? [];
    for (const existingParentId of childsCurrentDeps) {
      if (hasExistingDependencyPath(existingParentId, newParentTaskId, currentTaskMapForChecks)) {
        return { success: false, reason: 'skip_level_dependency', message: `상위 작업은 직접 연결할 수 없습니다.` };
      }
    }

    // 모든 검사를 통과했으므로 상태를 업데이트합니다.
    set(currentState => { // set 내부에서는 최신 상태인 currentState를 사용합니다.
      const taskMapForModification = new Map<string, Task>(
        currentState.allTasks.map(t => [t.taskId, {
          ...t, start: new Date(t.start), end: new Date(t.end), dependencies: [...(t.dependencies || [])],
        }])
      );

      const childTaskToModify = taskMapForModification.get(childTaskId);

      if (!childTaskToModify) {
        // 이 경우는 발생하기 어렵지만, 방어적으로 처리
        console.error("addDependency 내부 오류: childTaskToModify 찾을 수 없음");
        // set 내부에서는 외부 함수의 반환값에 직접 영향을 줄 수 없으므로, 여기서는 상태 변경 안 함을 의미하는 {} 반환
        return {};
      }

      if (!childTaskToModify.dependencies) childTaskToModify.dependencies = [];
      childTaskToModify.dependencies.push(newParentTaskId);

      updateTaskAndSuccessors(childTaskId, taskMapForModification, currentState.allTasks);
      const finalAllTasks = Array.from(taskMapForModification.values());

      return { allTasks: finalAllTasks };
    });

    // 상태 업데이트가 성공적으로 예약되었으므로 성공 결과 반환
    return { success: true, message: "의존성이 성공적으로 추가되었습니다." };
  },

}));

export default useTaskStore;

