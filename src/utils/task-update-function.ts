import { isAfter, isBefore } from "date-fns";
import { SelectOption, Task } from "../types/type";
import { getEffectiveEndDate } from "./date-function";

export const createTaskMap = (tasks: Task[]): Map<string, Task> => {
  return new Map(
    tasks.map(t => [
      t.taskId,
      {
        ...t,
        start: new Date(t.start),
        end: t.end ? new Date(t.end) : null,
        dependencies: t.dependencies ? [...t.dependencies] : [],
        todoList: t.todoList ? t.todoList.map(todo => ({ ...todo })) : [],
      },
    ])
  );
};

const calcNextOrder = (
  allTasks: Task[], filterKey: 'sectionId' | 'status', newId: string | number, taskIdToExclude: string
): number => {
  const tasksInNewGroup = allTasks.filter(t => {
    const taskValue = filterKey === 'status' ? t.status.code : t.sectionId;
    return taskValue === newId && t.taskId !== taskIdToExclude;
  });

  if (tasksInNewGroup.length === 0) return 0;

  const orderKey = filterKey === 'status' ? 'statusOrder' : 'sectionOrder';
  const existingOrders = tasksInNewGroup
    .map(t => t[orderKey])
    .filter(order => typeof order === 'number' && isFinite(order)) as number[];
  return existingOrders.length > 0 ? Math.max(...existingOrders) + 1 : 0;
};

export const handleSectionChange = (
  originalTask: Task,
  updated: Partial<Task>,
  allTasks: Task[],
): Partial<Task> => {
  if (updated.sectionId && updated.sectionId !== originalTask.sectionId) {
    return {
      sectionOrder: calcNextOrder(allTasks, 'sectionId', updated.sectionId, originalTask.taskId)
    }
  }
  return {};
};

export const syncStatusAndProgress = (
  originalTask: Task,
  updated: Partial<Task>,
  allTasks: Task[],
  statusList: SelectOption[]
): Partial<Task> => {
  const finalPayload: Partial<Task> = {};

  if (updated.status && updated.status.code !== originalTask.status.code) {
    const newStatusName = updated.status.name;
    const originalStatusName = originalTask.status.name;

    if (newStatusName === '대기') {
      finalPayload.progress = 0;
    } else if (newStatusName === '완료') {
      finalPayload.progress = 100;
    } else if (newStatusName === '진행') {
      if (originalStatusName === '대기') {
        finalPayload.progress = 1;
      } else if (originalStatusName === '완료') {
        finalPayload.progress = 99;
      }
    }
    finalPayload.statusOrder = calcNextOrder(allTasks, 'status', updated.status.code, originalTask.taskId);
  }

  else if (typeof updated.progress === 'number' && updated.progress !== originalTask.progress) {
    const newProgress = updated.progress;
    let targetStatusName: '대기' | '진행' | '완료' | null = null;

    if (newProgress === 0) targetStatusName = '대기';
    else if (newProgress === 100) targetStatusName = '완료';
    else targetStatusName = '진행';

    if (targetStatusName && targetStatusName !== originalTask.status.name) {
      const newStatus = statusList.find(s => s.name === targetStatusName);
      if (newStatus) {
        finalPayload.status = newStatus;
        finalPayload.statusOrder = calcNextOrder(allTasks, 'status', newStatus.code, originalTask.taskId);
      }
    }
  }

  return finalPayload;
};

export const propagateDateChanges = (
  taskMap: Map<string, Task>,
  originalTask: Task,
  updatedTask: Task,
  allOriginalTasks: Task[]
): Map<string, Task> => {
  const modifiedTasksCollector = new Map<string, Task>();

  // ✅ end가 null이어도 계산을 계속하기 위해 getEffectiveEndDate 사용
  const originalEffectiveEnd = getEffectiveEndDate(originalTask);
  const newEffectiveEnd = getEffectiveEndDate(updatedTask);

  // 유효한 날짜를 기준으로 변경 여부를 확인
  if (newEffectiveEnd.getTime() === originalEffectiveEnd.getTime()) return modifiedTasksCollector;

  const tasksToPropagate = [updatedTask.taskId];
  const visited = new Set<string>();

  while (tasksToPropagate.length > 0) {
    const currentId = tasksToPropagate.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const successors = Array.from(taskMap.values()).filter(t => t.dependencies?.includes(currentId));

    for (const succ of successors) {
      const originalSuccessor = allOriginalTasks.find(t => t.taskId === succ.taskId)!;
      // ✅ end가 null이어도 계산을 건너뛰지 않도록 start 여부만 확인
      if (!originalSuccessor.start) continue;

      let maxPotentialStart = new Date(0);

      for (const predId of succ.dependencies ?? []) {
        const predInMap = taskMap.get(predId)!;
        const originalPred = allOriginalTasks.find(t => t.taskId === predId)!;

        // ✅ 선행 작업의 end가 null이어도 건너뛰지 않음
        if (!originalSuccessor.start) continue;

        // ✅ 모든 .end.getTime() 호출을 getEffectiveEndDate를 통해 안전하게 처리
        const originalPredEffectiveEnd = getEffectiveEndDate(originalPred);
        const originalLagMs = originalSuccessor.start.getTime() - originalPredEffectiveEnd.getTime();

        const predInMapEffectiveEnd = getEffectiveEndDate(predInMap);
        const potentialStart = new Date(predInMapEffectiveEnd.getTime() + originalLagMs);

        if (potentialStart > maxPotentialStart) maxPotentialStart = potentialStart;
      }

      maxPotentialStart.setHours(
        originalSuccessor.start.getHours(),
        originalSuccessor.start.getMinutes(),
        originalSuccessor.start.getSeconds(),
        originalSuccessor.start.getMilliseconds()
      );

      // ✅ 후행 작업의 기간(duration) 계산 시에도 getEffectiveEndDate 사용
      const originalSuccessorEffectiveEnd = getEffectiveEndDate(originalSuccessor);
      const duration = originalSuccessorEffectiveEnd.getTime() - originalSuccessor.start.getTime();

      // ✅ 후행 작업의 end가 원래 null이었다면, 전파 후에도 null을 유지
      const newEndDate = originalSuccessor.end ? new Date(maxPotentialStart.getTime() + duration) : null;

      const updatedSuccessor = { ...succ, start: maxPotentialStart, end: newEndDate };

      // 변경 여부 확인 후 업데이트
      if (succ.start?.getTime() !== updatedSuccessor.start.getTime() || succ.end?.getTime() !== updatedSuccessor.end?.getTime()) {
        taskMap.set(succ.taskId, updatedSuccessor);
        modifiedTasksCollector.set(succ.taskId, updatedSuccessor);
        tasksToPropagate.push(succ.taskId);
      }
    }
  }
  return modifiedTasksCollector;
};

export const adjustTodosInTask = (task: Task): Task => {
  if (!task.todoList || task.todoList.length === 0) return task;
  const taskStart = new Date(task.start);
  const taskEnd = task.end ? new Date(task.end) : null;

  const adjustedTodoList = task.todoList.map(todo => {
    if (!todo.todoDt) return todo;
    const todoDate = new Date(todo.todoDt);
    let newTodoDate = todoDate;
    if (isBefore(todoDate, taskStart)) newTodoDate = taskStart;
    if (taskEnd && isAfter(todoDate, taskEnd)) newTodoDate = taskEnd;
    if (newTodoDate.getTime() !== todoDate.getTime()) return { ...todo, todoDt: newTodoDate };
    return todo;
  });
  return { ...task, todoList: adjustedTodoList };
};