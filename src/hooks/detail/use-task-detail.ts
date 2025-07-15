import { useMemo } from "react";
import { useKanbanActions } from "../../context/task-action-context";
import useStatusesStore from "../../store/statuses-store";
import useTaskStore from "../../store/task-store";
import useUserStore from "../../store/user-store";
import { priorityMedium } from "../../mocks/select-option-mock";
import { Task } from "../../types/type";

export const useTaskDetail = (taskId: string) => {
  const tasksFromStore = useTaskStore(state => state.allTasks);
  const updateTaskInStore = useTaskStore(state => state.updateTask);
  const statusList = useStatusesStore(state => state.statusList);
  const currentUser = useUserStore(state => state.currentUser);
  const { onTasksChange } = useKanbanActions();

  const task = useMemo(() => {
    const taskFromStore = tasksFromStore.find(t => t.taskId === taskId);
    if (!taskFromStore) return null;

    return {
      ...taskFromStore,
      participants: taskFromStore.participants || [],
      todoList: taskFromStore.todoList || [],
      urls: taskFromStore.urls || [],
      memo: taskFromStore.memo || "",
      taskAttachments: taskFromStore.taskAttachments || [],
      multiSelection: taskFromStore.multiSelection || [],
      singleSelection: taskFromStore.singleSelection || [],
      emails: taskFromStore.emails || [],
      prefix: taskFromStore.prefix || "",
      priority: taskFromStore.priority || priorityMedium,
      importance: taskFromStore.importance || 0,
      status: statusList.find(s => s.code === taskFromStore.status?.code) || taskFromStore.status || statusList[0],
    };
  }, [taskId, tasksFromStore, statusList]);

  const isOwnerOrParticipant = useMemo(() => {
    if (!task || !currentUser) return false;
    if (task.taskOwner.id === currentUser.id) return true;
    return task.participants.some(p => p.id === currentUser.id);
  }, [task, currentUser]);

  const updateTaskField = (updates: Partial<Task>) => {
    if (!task) return;
    const updatedTasks = updateTaskInStore(task.taskId, { ...updates });
    if (onTasksChange && updatedTasks && updatedTasks.length > 0) onTasksChange(updatedTasks);
  };

  return { task, updateTaskField, isOwnerOrParticipant, currentUser };
};