import { create } from "zustand";
import { Email, FileAttachment, SelectableOption, SelectOption, Task, Todo, UrlData } from "../types/type";
import { statusWaiting } from "../mocks/select-option-mock";
import { generateUniqueId } from "../utils/text-function";
import { hasExistingDependencyPath, updateTaskAndSuccessors } from "../utils/gantt/dependencies-utlis";

// 간트 차트 전용 의존성 추가 관련
export type AddDependencyResult =
  | { success: true; message?: string } // 성공 시 선택적 메시지
  | { success: false; reason: 'tasks_not_found' | 'self_dependency' | 'already_exists' | 'cycle_detected' | 'skip_level_dependency' | 'unknown_error'; message: string };

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

  updateTask: (taskId: string, updated: Partial<Task>) => {
    const allEffectivelyModifiedTasks: Task[] = [];

    set((state) => {
      // 1. 작업 객체 복사 및 Map 생성 (기존과 동일)
      const taskMap = new Map<string, Task>(
        state.allTasks.map(t => [
          t.taskId,
          {
            ...t,
            start: new Date(t.start),
            end: new Date(t.end),
            dependencies: t.dependencies ? [...t.dependencies] : [],
            todoList: t.todoList ? t.todoList.map(todo => ({ ...todo })) : [],
          },
        ])
      );

      const targetTask = taskMap.get(taskId); // 수정 대상 작업 (복사본)
      if (!targetTask) {
        console.error("Update failed: Task not found with ID -", taskId);
        return state;
      }

      // 원본 작업 (상태 변경 전) - sectionId, status.code 비교용
      const originalTaskFromState = state.allTasks.find(t => t.taskId === taskId);
      if (!originalTaskFromState) return state; // 이론상 발생 안 함

      const modifiedTasksCollector = new Map<string, Task>();

      // 2. 페이로드의 날짜 객체화 (기존과 동일)
      const updatedPayloadWithDates = { ...updated };
      if (updated.start && !(updated.start instanceof Date)) {
        updatedPayloadWithDates.start = new Date(updated.start);
      }
      if (updated.end && !(updated.end instanceof Date)) {
        updatedPayloadWithDates.end = new Date(updated.end);
      }

      // 3. sectionOrder 및 statusOrder 조정 로직 추가
      let finalPayload = { ...updatedPayloadWithDates };

      // 3a. sectionId가 변경되었는지 확인
      if (updated.sectionId && updated.sectionId !== originalTaskFromState.sectionId) {
        const tasksInNewSection = state.allTasks.filter(
          t => t.sectionId === updated.sectionId && t.taskId !== taskId // 자신은 제외하고 새 섹션의 기존 작업들
        );
        let nextSectionOrder = 0;
        if (tasksInNewSection.length > 0) {
          const existingOrders = tasksInNewSection
            .map(task => task.sectionOrder)
            .filter(order => typeof order === 'number' && isFinite(order)) as number[];
          if (existingOrders.length > 0) {
            nextSectionOrder = Math.max(...existingOrders) + 1;
          }
        }
        finalPayload.sectionOrder = nextSectionOrder;
      }

      // 3b. status.code가 변경되었는지 확인
      if (updated.status && updated.status.code !== originalTaskFromState.status.code) {
        const tasksInNewStatus = state.allTasks.filter(
          t => t.status.code === updated.status?.code && t.taskId !== taskId // 자신은 제외하고 새 상태의 기존 작업들
        );
        let nextStatusOrder = 0;
        if (tasksInNewStatus.length > 0) {
          const existingOrders = tasksInNewStatus
            .map(task => task.statusOrder)
            .filter(order => typeof order === 'number' && isFinite(order)) as number[];
          if (existingOrders.length > 0) {
            nextStatusOrder = Math.max(...existingOrders) + 1;
          }
        }
        finalPayload.statusOrder = nextStatusOrder;
      }

      // 4. 주 대상 작업 업데이트 (조정된 finalPayload 사용)
      const primarilyUpdatedTask = { ...targetTask, ...finalPayload };
      taskMap.set(taskId, primarilyUpdatedTask);
      modifiedTasksCollector.set(primarilyUpdatedTask.taskId, primarilyUpdatedTask);

      // 5. 후행 작업 조정 로직 (기존과 동일 - endChanged 기반)
      const originalTargetEndMs = targetTask.end?.getTime(); // 주의: targetTask는 finalPayload 적용 전 상태
      const newTargetEndMs = primarilyUpdatedTask.end?.getTime();
      const endChanged = newTargetEndMs !== undefined && newTargetEndMs !== originalTargetEndMs;

      if (endChanged && primarilyUpdatedTask.end && originalTargetEndMs !== undefined) {
        const deltaMs = newTargetEndMs - originalTargetEndMs;
        const visitedInCurrentPropagation = new Set<string>();

        const updateSuccessors = (currentPredecessorId: string, delta: number) => {
          // ... (기존 updateSuccessors 로직 동일) ...
          if (visitedInCurrentPropagation.has(currentPredecessorId)) {
            return;
          }
          visitedInCurrentPropagation.add(currentPredecessorId);

          const currentTask = taskMap.get(currentPredecessorId);
          if (!currentTask || !currentTask.end) return;
          const currentPredecessorEndDate = currentTask.end;
          const successors = Array.from(taskMap.values()).filter(t => t.dependencies?.includes(currentPredecessorId));

          for (const succ of successors) {
            const originalSuccessorStart = succ.start ? new Date(succ.start) : null;
            const originalSuccessorEnd = succ.end ? new Date(succ.end) : null;
            if (!originalSuccessorStart || !originalSuccessorEnd) continue;
            const duration = originalSuccessorEnd.getTime() - originalSuccessorStart.getTime();
            const successorOriginalHours = originalSuccessorStart.getHours();
            const successorOriginalMinutes = originalSuccessorStart.getMinutes();
            const successorOriginalSeconds = originalSuccessorStart.getSeconds();
            const successorOriginalMilliseconds = originalSuccessorStart.getMilliseconds();
            let shiftedStartDatePart = new Date(originalSuccessorStart.getTime() + delta);
            shiftedStartDatePart.setHours(
              successorOriginalHours,
              successorOriginalMinutes,
              successorOriginalSeconds,
              successorOriginalMilliseconds
            );
            let finalShiftedStart = shiftedStartDatePart;
            if (finalShiftedStart.getTime() < currentPredecessorEndDate.getTime()) {
              const newStartDateForSuccessor = new Date(currentPredecessorEndDate.getTime());
              newStartDateForSuccessor.setHours(
                successorOriginalHours,
                successorOriginalMinutes,
                successorOriginalSeconds,
                successorOriginalMilliseconds
              );
              finalShiftedStart = newStartDateForSuccessor;
              if (finalShiftedStart.getTime() < currentPredecessorEndDate.getTime())
                finalShiftedStart = new Date(currentPredecessorEndDate.getTime());
            }
            let newEnd = new Date(finalShiftedStart.getTime() + duration);
            if (newEnd.getTime() < finalShiftedStart.getTime()) newEnd = new Date(finalShiftedStart.getTime());
            const successorDatesChanged =
              (originalSuccessorStart.getTime() !== finalShiftedStart.getTime()) ||
              (originalSuccessorEnd.getTime() !== newEnd.getTime());
            if (successorDatesChanged) {
              succ.start = finalShiftedStart;
              succ.end = newEnd;
              taskMap.set(succ.taskId, succ);
              modifiedTasksCollector.set(succ.taskId, succ);
              updateSuccessors(succ.taskId, delta);
            }
          }
        };
        updateSuccessors(taskId, deltaMs);
      }

      allEffectivelyModifiedTasks.push(...Array.from(modifiedTasksCollector.values()));

      return { allTasks: Array.from(taskMap.values()) };
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
