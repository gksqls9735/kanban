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
    const newTasks = [...state.allTasks, newTask];
    return { allTasks: newTasks }
  }),

  updateTask: (taskId: string, updated: Partial<Task>) => { // 기존 시그니처 유지
    const allEffectivelyModifiedTasks: Task[] = [];

    set((state) => {
      const taskMap = new Map<string, Task>(
        state.allTasks.map(t => [
          t.taskId,
          {
            ...t,
            start: t.start instanceof Date ? t.start : new Date(t.start),
            end: t.end instanceof Date ? t.end : new Date(t.end),
            dependencies: t.dependencies ? [...t.dependencies] : [],
            todoList: t.todoList ? t.todoList.map(todo => ({ ...todo })) : [],
          },
        ])
      );

      const targetTask = taskMap.get(taskId);
      if (!targetTask) {
        console.error("Update failed: Task not found with ID -", taskId);
        return state;
      }

      const originalTaskFromState = state.allTasks.find(t => t.taskId === taskId);
      if (!originalTaskFromState) {
        console.error("Original task not found for ID -", taskId);
        return state;
      }

      const modifiedTasksCollector = new Map<string, Task>();

      const updatedPayloadWithDates: Partial<Task> = { ...updated };
      if (updated.start && !(updated.start instanceof Date)) {
        updatedPayloadWithDates.start = new Date(updated.start);
      }
      if (updated.end && !(updated.end instanceof Date)) {
        updatedPayloadWithDates.end = new Date(updated.end);
      }

      let finalPayload: Partial<Task> = { ...updatedPayloadWithDates };

      // 섹션/상태 변경 로직은 그대로 유지
      if (updated.sectionId && updated.sectionId !== originalTaskFromState.sectionId) {
        const tasksInNewSection = state.allTasks.filter(
          t => t.sectionId === updated.sectionId && t.taskId !== taskId
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

      if (updated.status && updated.status.code !== originalTaskFromState.status.code) {
        const tasksInNewStatus = state.allTasks.filter(
          t => t.status.code === updated.status?.code && t.taskId !== taskId
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

      const primarilyUpdatedTask = { ...targetTask, ...finalPayload };
      taskMap.set(taskId, primarilyUpdatedTask);
      modifiedTasksCollector.set(primarilyUpdatedTask.taskId, primarilyUpdatedTask); // 변경된 작업 수집

      const originalTargetEndMs = targetTask.end?.getTime();
      const newTargetEndMs = primarilyUpdatedTask.end?.getTime();
      const endChanged = newTargetEndMs !== undefined && newTargetEndMs !== originalTargetEndMs;

      if (endChanged && primarilyUpdatedTask.end && originalTargetEndMs !== undefined) {
        const deltaMs = newTargetEndMs - originalTargetEndMs;
        const tasksToPropagate = [taskId]; // 큐: 전파 시작 작업부터
        const visitedInCurrentPropagation = new Set<string>(); // 순환 참조 방지 및 중복 처리 방지

        // 기존 updateSuccessors를 재귀 함수 대신 큐 기반 반복문으로 변경 (move.ts와 유사하게)
        while (tasksToPropagate.length > 0) {
          const currentPredecessorId = tasksToPropagate.shift()!;
          if (visitedInCurrentPropagation.has(currentPredecessorId)) {
            continue;
          }
          visitedInCurrentPropagation.add(currentPredecessorId);

          const currentPredecessorTask = taskMap.get(currentPredecessorId);
          if (!currentPredecessorTask || !currentPredecessorTask.end) continue;

          const successors = Array.from(taskMap.values()).filter(t => t.dependencies?.includes(currentPredecessorId));

          for (const succ of successors) {
            const originalSuccessorFullData = state.allTasks.find(t => t.taskId === succ.taskId); // 원본 데이터에서 시간 정보 가져오기
            if (!originalSuccessorFullData || !originalSuccessorFullData.start || !originalSuccessorFullData.end) continue;

            const duration = originalSuccessorFullData.end.getTime() - originalSuccessorFullData.start.getTime();

            // **이 부분이 핵심 수정: 모든 선행 작업을 고려하여 minStart 계산**
            let effectiveMinStartForSuccessor: Date | null = null;
            const allPredecessorsOfSuccessor = Array.from(taskMap.values()).filter(t => (succ.dependencies ?? []).includes(t.taskId)); // 현재 맵 기준으로 선행 작업 필터링

            for (const predOfSucc of allPredecessorsOfSuccessor) {
              // 선행 작업의 현재 (임시) 종료일을 가져옵니다.
              // taskMap에서 가져온 것이 가장 최신 임시 상태입니다.
              const predCurrentInfoInMap = taskMap.get(predOfSucc.taskId);
              const predOriginalInfoFromState = state.allTasks.find(t => t.taskId === predOfSucc.taskId);

              if (!predCurrentInfoInMap || !predCurrentInfoInMap.end || !predOriginalInfoFromState || !predOriginalInfoFromState.end) {
                continue;
              }

              // 선행 작업의 원래 종료일과 후행 작업의 원래 시작일 사이의 간격 (lag time) 계산
              const originalLagMs = originalSuccessorFullData.start.getTime() - predOriginalInfoFromState.end.getTime();

              // 이 선행 작업에 의해 결정되는 후행 작업의 잠재적 시작일
              const potentialStart = new Date(predCurrentInfoInMap.end.getTime() + originalLagMs);

              // 시간 정보 유지 (후행 작업의 원래 시간을 따름)
              potentialStart.setHours(
                originalSuccessorFullData.start.getHours(),
                originalSuccessorFullData.start.getMinutes(),
                originalSuccessorFullData.start.getSeconds(),
                originalSuccessorFullData.start.getMilliseconds()
              );

              if (!effectiveMinStartForSuccessor || potentialStart.getTime() > effectiveMinStartForSuccessor.getTime()) {
                effectiveMinStartForSuccessor = potentialStart;
              }
            }

            // 모든 선행 작업에 대한 계산을 마친 후 최종적인 새 시작일 결정
            let newSuccessorStart: Date;
            if (effectiveMinStartForSuccessor) {
              newSuccessorStart = effectiveMinStartForSuccessor;
            } else {
              // 의존성이 없는 후행 작업이거나, 어떤 선행 작업도 유효하지 않은 경우
              // 이 경우는 주 작업의 delta에 의해 밀리는 것이 일반적이므로
              // 원래 시작일에 delta를 더하여 계산합니다.
              newSuccessorStart = new Date(originalSuccessorFullData.start.getTime() + deltaMs);
              newSuccessorStart.setHours(
                originalSuccessorFullData.start.getHours(),
                originalSuccessorFullData.start.getMinutes(),
                originalSuccessorFullData.start.getSeconds(),
                originalSuccessorFullData.start.getMilliseconds()
              );
            }

            const newSuccessorEnd = new Date(newSuccessorStart.getTime() + duration);

            const successorDatesChanged =
              (succ.start?.getTime() !== newSuccessorStart.getTime()) ||
              (succ.end?.getTime() !== newSuccessorEnd.getTime());

            if (successorDatesChanged) {
              const updatedSucc = { ...succ, start: newSuccessorStart, end: newSuccessorEnd };
              taskMap.set(succ.taskId, updatedSucc);
              modifiedTasksCollector.set(updatedSucc.taskId, updatedSucc);
              tasksToPropagate.push(succ.taskId); // 변경된 후행 작업을 큐에 추가하여 연쇄 전파
            }
          }
        }
      }

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
