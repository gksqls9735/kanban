import { create } from "zustand";
import { Email, FileAttachment, SelectableOption, SelectOption, Task, Todo, UrlData } from "../types/type";
import { statusWaiting } from "../mocks/select-option-mock";
import { generateUniqueId } from "../utils/text-function";
import { hasExistingDependencyPath, updateTaskAndSuccessors } from "../utils/gantt/dependencies-utlis";
import useStatusesStore from "./statuses-store";
import { createTaskMap, handleSectionChange, propagateDateChanges, syncStatusAndProgress } from "../utils/task-update-function";
import isEqual from "lodash.isequal";


// 간트 차트 전용 의존성 추가 관련
type AddDependencyResult = {
  success: boolean;
  reason?: 'tasks_not_found' | 'self_dependency' | 'already_exists' | 'cycle_detected' | 'skip_level_dependency' | 'internal_error' | 'dependency_with_temp_task';
  message: string;
  updatedTasks?: Task[];
};

export interface NewTaskUiState {
  hasInteracted: boolean;
}

interface TaskState {
  allTasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (newTask: Task) => void;
  updateTask: (taskId: string, updated: Partial<Task>) => Task[];
  deleteTask: (taskId: string) => void;
  copyTask: (originalTask: Task) => { copiedTask: Task | undefined, shiftedTasks: Task[] };
  deleteTasksBySection: (sectionId: string) => void;
  updateTasksByStatus: (originalStatusCode: string) => Task[];
  updateTasksWithNewStatusDetails: (newStatus: SelectOption) => void;
  addDependency: (endId: string, startId: string, isStartParent: boolean) => Promise<AddDependencyResult>;

  tempNewTasks: Task[],
  addTempTask: (newTask: Task) => void;
  removeTempTask: (taskId: string) => void;
  commitTempTask: (taskToCommit: Task) => void;
  updateTempTask: (taskId: string, updates: Partial<Task>) => void;


  newTaskUiStates: Map<string, NewTaskUiState>;
  initNewTaskUiState: (taskId: string) => void;
  updateNewTaskUiState: (taskId: string, updates: Partial<NewTaskUiState>) => void;
  removeNewTaskUiState: (taskId: string) => void;
  applyBatchUpdates: (updates: Map<string, Partial<Task>>) => Task[];
}

const useTaskStore = create<TaskState>((set, get) => ({

  allTasks: [],

  setTasks: (tasks: Task[]) => set({ allTasks: tasks }),

  addTask: (newTask: Task) => set((state) => {
    const newTasks = [...state.allTasks, newTask];
    return { allTasks: newTasks }
  }),

  updateTask: (taskId: string, updated: Partial<Task>) => { // 기존 시그니처 유지
    const allEffectivelyModifiedTasks: Task[] = [];

    set((state) => {
      const taskMap = createTaskMap(state.allTasks);
      const originalTask = state.allTasks.find(t => t.taskId === taskId);
      const targetTask = taskMap.get(taskId);

      if (!targetTask || !originalTask) {
        console.error("Update failed: Task not found with ID -", taskId);
        return state;
      }

      const modifiedTasksCollector = new Map<string, Task>();
      let finalPayload: Partial<Task> = { ...updated };

      if (updated.start && !(updated.start instanceof Date)) finalPayload.start = new Date(updated.start);
      if (updated.end && !(updated.end instanceof Date)) finalPayload.end = new Date(updated.end);

      // 섹션 변경
      const sectionUpdates = handleSectionChange(originalTask, updated, state.allTasks);
      finalPayload = { ...finalPayload, ...sectionUpdates };

      // 상태/진행률 동기화 처리
      const statusList = useStatusesStore.getState().statusList;
      const statusProgressUpdates = syncStatusAndProgress(originalTask, updated, state.allTasks, statusList);
      finalPayload = { ...finalPayload, ...statusProgressUpdates };

      // Task 업데이트 적용
      const primarilyUpdatedTask = { ...targetTask, ...finalPayload };
      taskMap.set(taskId, primarilyUpdatedTask);
      modifiedTasksCollector.set(taskId, primarilyUpdatedTask);

      // 날짜 변경 전파
      const propagatedChanges = propagateDateChanges(taskMap, originalTask, primarilyUpdatedTask, state.allTasks);
      propagatedChanges.forEach((t, id) => modifiedTasksCollector.set(id, t));

      // 최종 상태 업데이트
      const newAllTasks = Array.from(taskMap.values());
      allEffectivelyModifiedTasks.push(...Array.from(modifiedTasksCollector.values()));

      return { allTasks: newAllTasks };
    });

    return allEffectivelyModifiedTasks;
  },


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

  copyTask: (originalTask: Task) => {
    let taskThatWasCopied: Task | undefined = undefined;
    let tasksWhoseOrdersChanged: Task[] = [];

    set((state) => {
      const currentOriginalTask = state.allTasks.find(t => t.taskId === originalTask.taskId);
      if (!currentOriginalTask) return state;

      const copiedTaskId = generateUniqueId('task');
      const newSectionOrder = currentOriginalTask.sectionOrder + 1;
      const newStatusOrder = currentOriginalTask.statusOrder + 1;

      let newTaskAttachments: FileAttachment[] = [];
      if (currentOriginalTask.taskAttachments && currentOriginalTask.taskAttachments.length > 0)
        newTaskAttachments = currentOriginalTask.taskAttachments.map(file => ({ ...file, fileId: generateUniqueId('file') }));

      let newUrls: UrlData[] = [];
      if (currentOriginalTask.urls && currentOriginalTask.urls.length > 0)
        newUrls = currentOriginalTask.urls.map(url => ({ ...url, urlId: generateUniqueId('url') }));

      let newMultiSelection: SelectableOption[] = [];
      if (currentOriginalTask.multiSelection && currentOriginalTask.multiSelection.length > 0)
        newMultiSelection = currentOriginalTask.multiSelection.map(option => ({ ...option, code: generateUniqueId('multi-selection') }));

      let newSingleSelection: SelectableOption[] = [];
      if (currentOriginalTask.singleSelection && currentOriginalTask.singleSelection.length > 0)
        newSingleSelection = currentOriginalTask.singleSelection.map(option => ({ ...option, code: generateUniqueId('single-selection') }))

      let newEmails: Email[] = [];
      if (currentOriginalTask.emails && currentOriginalTask.emails.length > 0)
        newEmails = currentOriginalTask.emails.map(email => ({ ...email, id: generateUniqueId('email') }));

      let newTodos: Todo[] = [];
      if (currentOriginalTask.todoList && currentOriginalTask.todoList.length > 0) {
        newTodos = currentOriginalTask.todoList.map(todo => ({ ...todo, todoId: generateUniqueId('todo'), taskId: copiedTaskId }))
      }

      const copiedTaskObject: Task = {
        ...currentOriginalTask,
        taskId: copiedTaskId,
        sectionOrder: newSectionOrder,
        statusOrder: newStatusOrder,
        taskAttachments: newTaskAttachments,
        urls: newUrls,
        multiSelection: newMultiSelection,
        singleSelection: newSingleSelection,
        emails: newEmails,
        todoList: newTodos,
        chatlist: [],
        dependencies: [], // 고려 필요
      };

      taskThatWasCopied = copiedTaskObject;

      const localShiftedTasksAccumulator: Task[] = [];
      const updatedTasksFullList = state.allTasks.map(task => {
        let updatedTask = { ...task };
        let sectionOrderWasShifted = false;
        let statusOrderWasShifted = false;

        if (task.sectionId === currentOriginalTask.sectionId && task.sectionOrder >= newSectionOrder) {
          updatedTask.sectionOrder += 1;
          sectionOrderWasShifted = true;
        }
        if (task.status.code === currentOriginalTask.status.code && task.statusOrder >= newStatusOrder) {
          updatedTask.statusOrder += 1;
          statusOrderWasShifted = true;
        }

        if (sectionOrderWasShifted || statusOrderWasShifted) {
          localShiftedTasksAccumulator.push(updatedTask); // 변경된 작업만 수집
        }
        return updatedTask;
      });
      tasksWhoseOrdersChanged = localShiftedTasksAccumulator;


      return { allTasks: [...updatedTasksFullList, copiedTaskObject] };
    });
    return { copiedTask: taskThatWasCopied, shiftedTasks: tasksWhoseOrdersChanged, };
  },


  deleteTasksBySection: (sectionId: string) => set((state) => {
    const remainingTasks = state.allTasks.filter(t => t.sectionId !== sectionId);
    return { allTasks: remainingTasks };
  }),

  updateTasksByStatus: (originalStatusCode: string) => {
    const actuallyChangedTasks: Task[] = [];
    set((state) => {
      const tasksInTargetStatus = state.allTasks.filter(t => t.status.code === statusWaiting.code);
      let nextAvailableStatusOrder = 0;

      if (tasksInTargetStatus.length > 0) {
        const existingStatusOrders = tasksInTargetStatus.map(t => t.statusOrder)
          .filter(order => typeof order === 'number' && isFinite(order)) as number[];
        if (existingStatusOrders.length > 0) nextAvailableStatusOrder = Math.max(...existingStatusOrders) + 1;
      }

      const updatedTasks = state.allTasks.map(t => {
        if (t.status.code === originalStatusCode) {
          const changedTask = { ...t, status: statusWaiting, statusOrder: nextAvailableStatusOrder++ };
          actuallyChangedTasks.push(changedTask);
          return changedTask;
        }
        return t;
      });

      if (actuallyChangedTasks.length === 0) {
        return state;
      }

      return { allTasks: updatedTasks };
    });

    return actuallyChangedTasks;
  },

  updateTasksWithNewStatusDetails: (newStatus: SelectOption) => set((state) => {
    const newTasks = state.allTasks.map(t =>
      newStatus.code === t.status.code ? { ...t, status: newStatus } : t
    );
    return { allTasks: newTasks };
  }),

  addDependency: async (endId: string, startId: string, isStartParent: boolean): Promise<AddDependencyResult> => {
    const state = get();

    const childTaskId = isStartParent ? endId : startId;
    const newParentTaskId = isStartParent ? startId : endId;

    const childTaskFromState = state.allTasks.find(t => t.taskId === childTaskId);
    const newParentTaskFromState = state.allTasks.find(t => t.taskId === newParentTaskId);

    if (!childTaskFromState || !newParentTaskFromState) {
      const isTemp =
        state.tempNewTasks.some(t => t.taskId === childTaskId || t.taskId === newParentTaskId);
      if (isTemp) return { success: false, reason: 'dependency_with_temp_task', message: "저장되지 않은 작업과는 의존성을 연결할 수 없습니다." };
      return { success: false, reason: 'tasks_not_found', message: "연결할 작업을 찾을 수 없습니다." };
    }
    if (childTaskId === newParentTaskId) {
      return { success: false, reason: 'self_dependency', message: "자기 자신에게 의존성을 추가할 수 없습니다." };
    }
    if ((childTaskFromState.dependencies ?? []).includes(newParentTaskId)) {
      return { success: false, reason: 'already_exists', message: "이미 존재하는 의존성입니다." };
    }

    const taskMapForChecks = new Map(state.allTasks.map(t => [t.taskId, { ...t, dependencies: [...(t.dependencies || [])] }]));

    if (hasExistingDependencyPath(newParentTaskId, childTaskId, taskMapForChecks)) {
      return { success: false, reason: 'cycle_detected', message: "순환 의존성은 허용되지 않습니다." };
    }
    for (const existingParentId of childTaskFromState.dependencies ?? []) {
      if (hasExistingDependencyPath(existingParentId, newParentTaskId, taskMapForChecks)) {
        return { success: false, reason: 'skip_level_dependency', message: "상위 작업은 직접 연결할 수 없습니다." };
      }
    }

    return new Promise((resolve) => {
      set(currentState => {
        const originalTaskMap = new Map(currentState.allTasks.map(t => [t.taskId, {
          ...t,
          start: new Date(t.start),
          end: t.end ? new Date(t.end) : null,
          dependencies: [...(t.dependencies ?? [])]
        }]));
        const taskMapForModification = new Map(currentState.allTasks.map(t => [t.taskId, {
          ...t,
          start: new Date(t.start),
          end: t.end ? new Date(t.end) : null,
          dependencies: [...(t.dependencies ?? [])]
        }]));

        const childTaskToModify = taskMapForModification.get(childTaskId);
        if (!childTaskToModify) {
          console.error("addDependency 내부 오류: childTaskToModify 찾을 수 없음");
          resolve({ success: false, reason: 'internal_error', message: "내부 오류가 발생했습니다." });
          return {};
        }

        childTaskToModify.dependencies = [...(childTaskToModify.dependencies || []), newParentTaskId];
        updateTaskAndSuccessors(childTaskId, taskMapForModification, currentState.allTasks);

        const finalAllTasks = Array.from(taskMapForModification.values());

        const updatedTasks = finalAllTasks.filter(updatedTask => {
          const originalTask = originalTaskMap.get(updatedTask.taskId);
          if (!originalTask) return true;

          const depsChanged = !isEqual(originalTask.dependencies, updatedTask.dependencies);
          const startChanged = originalTask.start.getTime() !== updatedTask.start.getTime();
          const endChanged = (originalTask.end?.getTime() ?? null) !== (updatedTask.end?.getTime() ?? null);

          return depsChanged || startChanged || endChanged;
        });

        resolve({ success: true, message: "의존성이 성공적으로 추가되었습니다.", updatedTasks });

        return { allTasks: finalAllTasks };
      })
    });
  },
  tempNewTasks: [],
  addTempTask: (newTask) => set(state => ({
    tempNewTasks: [...state.tempNewTasks, newTask]
  })),
  removeTempTask: (taskId) => set(state => ({
    tempNewTasks: state.tempNewTasks.filter(t => t.taskId !== taskId)
  })),
  commitTempTask: (taskToCommit: Task) => set(state => ({
    tempNewTasks: state.tempNewTasks.filter(t => t.taskId !== taskToCommit.taskId),
    allTasks: [...state.allTasks, { ...taskToCommit, isNew: false }]
  })),
  updateTempTask: (taskId, updates) => {
    set(state => {
      const originalTask = state.tempNewTasks.find(t => t.taskId === taskId);
      if (!originalTask) return state;

      const statusList = useStatusesStore.getState().statusList;
      const allTasks = [...get().allTasks, ...get().tempNewTasks];

      const derivedUpdates = syncStatusAndProgress(originalTask, updates, allTasks, statusList);

      const finalPayload = { ...updates, ...derivedUpdates };
      const updatedTempNewTasks = state.tempNewTasks.map(t => t.taskId === taskId ? { ...t, ...finalPayload } : t);
      return { tempNewTasks: updatedTempNewTasks };
    })
  },


  newTaskUiStates: new Map(),

  initNewTaskUiState: (taskId) => {
    set(state => {
      const newUiStates = new Map(state.newTaskUiStates);
      newUiStates.set(taskId, { hasInteracted: false });
      return { newTaskUiStates: newUiStates };
    });
  },

  updateNewTaskUiState: (taskId, updates) => {
    set(state => {
      const newUiStates = new Map(state.newTaskUiStates);
      const currentState = newUiStates.get(taskId) || { hasInteracted: false };
      newUiStates.set(taskId, { ...currentState, ...updates });
      return { newTaskUiStates: newUiStates };
    })
  },

  removeNewTaskUiState: (taskId) => {
    set(state => {
      const newUiStates = new Map(state.newTaskUiStates);
      newUiStates.delete(taskId);
      return { newTaskUiStates: newUiStates };
    })
  },

  applyBatchUpdates: (updates: Map<string, Partial<Task>>) => {
    let allEffectivelyModifiedTasks: Task[] = [];
    set((state) => {
      const taskMap = createTaskMap(state.allTasks);
      updates.forEach((value, taskId) => {
        const existingTask = taskMap.get(taskId);
        if (existingTask) {
          const updatedTask = { ...existingTask, ...value };
          taskMap.set(taskId, updatedTask);
        }
      });
      const newAllTasks = Array.from(taskMap.values());
      allEffectivelyModifiedTasks = Array.from(updates.keys()).map(id => taskMap.get(id)!);
      return { allTasks: newAllTasks };
    });
    return allEffectivelyModifiedTasks;
  },
}));

export default useTaskStore;

