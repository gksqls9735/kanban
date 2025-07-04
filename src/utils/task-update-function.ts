import { SelectOption, Task } from "../types/type";

export const createTaskMap = (tasks: Task[]): Map<string, Task> => {
  return new Map(
    tasks.map(t => [
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

  if (typeof updated.progress === 'number' && updated.progress !== originalTask.progress) {
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
  const originalEndMs = originalTask.end?.getTime();
  const newEndMs = updatedTask.end?.getTime();

  if (newEndMs === undefined || originalEndMs === undefined || newEndMs === originalEndMs) {
    return modifiedTasksCollector;
  }

  const tasksToPropagate = [updatedTask.taskId];
  const visited = new Set<string>();

  while (tasksToPropagate.length > 0) {
    const currentId = tasksToPropagate.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    //const predecessor = taskMap.get(currentId)!;
    const successors = Array.from(taskMap.values()).filter(t => t.dependencies?.includes(currentId));

    for (const succ of successors) {
      const originalSuccessor = allOriginalTasks.find(t => t.taskId === succ.taskId)!;
      if (!originalSuccessor.start || !originalSuccessor.end) continue;
      
      let maxPotentialStart = new Date(0);

      for (const predId of succ.dependencies ?? []) {
        const predInMap = taskMap.get(predId)!;
        const originalPred = allOriginalTasks.find(t => t.taskId === predId)!;

        if (!predInMap.end || !originalPred.end || !originalSuccessor.start) continue;

        const originalLagMs = originalSuccessor.start.getTime() - originalPred.end.getTime();
        const potentialStart = new Date(predInMap.end.getTime() + originalLagMs);

        if (potentialStart > maxPotentialStart) {
          maxPotentialStart = potentialStart;
        }
      }

      maxPotentialStart.setHours(
        originalSuccessor.start.getHours(),
        originalSuccessor.start.getMinutes(),
        originalSuccessor.start.getSeconds(),
        originalSuccessor.start.getMilliseconds()
      );

      const duration = originalSuccessor.end.getTime() - originalSuccessor.start.getTime();
      const newEndDate = new Date(maxPotentialStart.getTime() + duration);

      if (succ.start?.getTime() !== maxPotentialStart.getTime() || succ.end?.getTime() !== newEndDate.getTime()) {
        const updatedSuccessor = { ...succ, start: maxPotentialStart, end: newEndDate };
        taskMap.set(succ.taskId, updatedSuccessor);
        modifiedTasksCollector.set(succ.taskId, updatedSuccessor);
        tasksToPropagate.push(succ.taskId);
      }
    }
  }
  return modifiedTasksCollector;
};