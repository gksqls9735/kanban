import { Task } from "../../types/type";

export const updateTaskAndSuccessors = (
  updateId: string, taskMap: Map<string, Task>, allTasks: Readonly<Task[]>,
) => {
  const task = taskMap.get(updateId);
  if (!task) return;

  const originalStart = task.start.getTime();

  const dependencies = (task.dependencies || [])
    .map(depId => taskMap.get(depId)).filter((dep): dep is Task => Boolean(dep));

  const minStart = dependencies.length > 0
    ? new Date(Math.max(...dependencies.map(d => d.end.getTime())))
    : null;

  let newStart = new Date(task.start);
  const duration = task.end.getTime() - task.start.getTime();

  if (minStart && newStart.getTime() < minStart.getTime()) newStart = new Date(minStart);

  if (newStart.getTime() !== originalStart) {
    task.start = newStart;
    task.end = new Date(newStart.getTime() + duration);

    taskMap.set(updateId, task);

    const successors = allTasks.filter(t => t.dependencies?.includes(updateId));
    successors.forEach(t => {
      updateTaskAndSuccessors(t.taskId, taskMap, allTasks);
    });
  }
};


export const hasExistingDependencyPath = (
  fromTaskId: string, toTaskId: string, taskMap: Map<string, Task>,
): boolean => {
  const queue: string[] = [fromTaskId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (currentId === toTaskId) return true;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const task = taskMap.get(currentId);
    if (task && task.dependencies) {
      for (const depId of task.dependencies) {
        if (!visited.has(depId)) queue.push(depId);
      }
    }
  }
  return false;
};