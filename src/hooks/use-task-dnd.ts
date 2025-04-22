import { useState } from "react";
import useTaskStore from "../store/task-store";
import useViewModeStore from "../store/viewmode-store";
import { Section, SelectOption, Task } from "../types/type";
import { DragEndEvent, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ViewModes } from "../constants";

const sortTasks = (tasksToSort: Task[]): Task[] => {
  return [...tasksToSort].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const useTaskDnd = (sections: Section[], statusList: SelectOption[]) => {
  const { viewMode } = useViewModeStore();
  const setTasks = useTaskStore(state => state.setTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8, }
    }),
    useSensor(KeyboardSensor)
  );

  const getColumnId = (task: Task) => { return viewMode === ViewModes.STATUS ? task.status.code : task.sectionId };

  const handleDragStart = (e: DragStartEvent) => {
    const { active } = e;
    const taskId = active.id as string;
    const currentTasks = useTaskStore.getState().allTasks;
    const task = currentTasks.find(t => t.taskId === taskId);
    if (task) setActiveTask(task);
  };

  const handleDragCancel = () => { setActiveTask(null) };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const currentTasks = useTaskStore.getState().allTasks;

    const activeTaskIndex = currentTasks.findIndex(t => t.taskId === activeTaskId);
    if (activeTaskIndex === -1) {
      console.error("Active task not found in current tasks");
      return;
    }

    const originalActiveTaskData = currentTasks[activeTaskIndex];
    const activeColumnId = getColumnId(originalActiveTaskData);

    const isOverAColumn = viewMode === ViewModes.STATUS
      ? statusList.some(s => s.code === overId)
      : sections.some(s => s.sectionId === overId);

    let newTasks = [...currentTasks];

    // 컬럼 위로 드롭
    if (isOverAColumn) {
      const targetColumnId = overId;
      if (activeColumnId !== targetColumnId) {
        const updatedTask = { ...originalActiveTaskData };
        if (viewMode === ViewModes.STATUS) {
          const newStatus = statusList.find(s => s.code === targetColumnId);
          if (!newStatus) return;
          updatedTask.status = newStatus;
        } else {
          const newSection = sections.find(s => s.sectionId === targetColumnId);
          if (!newSection) return;
          updatedTask.sectionId = targetColumnId;
        }

        const tasksInTargetColumn = newTasks
          .filter(t => getColumnId(t) === targetColumnId && t.taskId !== activeTaskId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        updatedTask.order = tasksInTargetColumn.length;

        newTasks = newTasks.filter(t => t.taskId !== activeTaskId);

        newTasks = newTasks.map(t => {
          if (getColumnId(t) === activeColumnId && (t.order ?? 0) > (originalActiveTaskData.order ?? 0)) {
            return { ...t, order: (t.order ?? 0) - 1 };
          }
          return t;
        });
        newTasks.push(updatedTask);
      }
    } else {
      // 다른 작업 위로 드롭
      const overTaskId = overId;
      const overTaskIndex = newTasks.findIndex(t => t.taskId === overTaskId);
      if (overTaskIndex === -1) {
        console.error("Over task not found in current tasks");
        return;
      }
      const overTask = newTasks[overTaskIndex];
      const overColumnId = getColumnId(overTask);

      // 같은 컬럼 내 이동
      if (activeColumnId === overColumnId) {
        const tasksInColumn = newTasks
          .filter(t => getColumnId(t) === activeColumnId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const oldIndex = tasksInColumn.findIndex(t => t.taskId === activeTaskId);
        const newIndex = tasksInColumn.findIndex(t => t.taskId === overTaskId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedTaskIds = arrayMove(tasksInColumn.map(t => t.taskId), oldIndex, newIndex);
          const columnUpdates = new Map<string, number>();
          reorderedTaskIds.forEach((taskId, index) => { columnUpdates.set(taskId, index) });

          newTasks = newTasks.map(t => {
            if (getColumnId(t) === activeColumnId && columnUpdates.has(t.taskId)) {
              return { ...t, order: columnUpdates.get(t.taskId)! };
            }
            return t;
          });
        }
      } else {
        // 다른 컬럼으로 이동
        const targetColumnId = overColumnId;
        const updatedTask = { ...originalActiveTaskData };

        if (viewMode === ViewModes.STATUS) {
          const newStatus = statusList.find(s => s.code === targetColumnId);
          if (!newStatus) return;
          updatedTask.status = newStatus;
        } else {
          const newSection = sections.find(s => s.sectionId === targetColumnId);
          if (!newSection) return;
          updatedTask.sectionId = targetColumnId;
        }

        const overTaskOrder = overTask.order ?? 0;
        updatedTask.order = overTaskOrder;

        const tasksWithoutActive = newTasks.filter(t => t.taskId !== activeTaskId);
        const targetColumnUpdates = new Map<string, number>();
        const sourceColumnUpdates = new Map<string, number>();

        tasksWithoutActive.forEach(t => {
          const colId = getColumnId(t);
          const currentOrder = t.order ?? 0;
          if (colId === targetColumnId && currentOrder >= overTaskOrder) {
            targetColumnUpdates.set(t.taskId, currentOrder + 1);
          } else if (colId === activeColumnId && currentOrder > (originalActiveTaskData.order ?? 0)) {
            sourceColumnUpdates.set(t.taskId, currentOrder - 1);
          }
        });

        newTasks = tasksWithoutActive.map(t => {
          if (targetColumnUpdates.has(t.taskId)) return { ...t, order: targetColumnUpdates.get(t.taskId)! };
          if (sourceColumnUpdates.has(t.taskId)) return { ...t, order: sourceColumnUpdates.get(t.taskId)! };
          return t;
        });
        newTasks.push(updatedTask);
      }
    }
    setTasks(sortTasks(newTasks));
  };
  return {
    sensors,
    activeTask,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};