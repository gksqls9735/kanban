import { useState } from "react";
import useTaskStore from "../store/task-store";
import useViewModeStore from "../store/viewmode-store";
import { Section, SelectOption, Task } from "../types/type";
import { DragEndEvent, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ViewModes } from "../constants";
import { lightenColor } from "../utils/color-function";

export interface ActiveColumnData {
  id: string;
  title: string;
  type: 'Column'
  tasks: Task[];
  colorMain?: string;
  colorSub?: string;
  getSectionName: (sectionId: string) => string;
}

const sortTasks = (tasksToSort: Task[]): Task[] => {
  return [...tasksToSort].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const useKanbanDnd = (
  orderedSections: Section[], // 정렬된 섹션 상태
  setOrderedSections: React.Dispatch<React.SetStateAction<Section[]>>, // 섹션 순서 변경 함수
  orderedStatusList: SelectOption[], // 정렬된 상태 목록 상태
  setOrderedStatusList: React.Dispatch<React.SetStateAction<SelectOption[]>>, // 상태 순서 변경 함
) => {
  const { viewMode } = useViewModeStore();
  const setTasks = useTaskStore(state => state.setTasks);
  const allTasks = useTaskStore(state => state.allTasks);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ActiveColumnData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8, }
    }),
    useSensor(KeyboardSensor)
  );

  const getColumnId = (task: Task) => { return viewMode === ViewModes.STATUS ? task.status.code : task.sectionId };

  const getTasksForColumn = (columnId: string) => {
    return allTasks
      .filter(t => (viewMode === ViewModes.STATUS ? t.status.code : t.sectionId) === columnId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const getSectionName = (sectionId: string) => {
    return orderedSections.find(sec => sec.sectionId === sectionId)?.sectionName || '';
  };

  const handleDragStart = (e: DragStartEvent) => {
    const { active } = e;
    const type = active.data.current?.type;

    if (type === 'Task') {
      const taskId = active.id as string;
      const task = allTasks.find(t => t.taskId === taskId);
      if (task) setActiveTask(task);
      setActiveColumn(null);
    } else if (type === 'Column') {
      const columnId = active.id as string;
      let columnData: ActiveColumnData | null = null;

      if (viewMode === ViewModes.STATUS) {
        const status = orderedStatusList.find(s => s.code === columnId);
        if (status) {
          columnData = {
            id: status.code,
            title: status.name,
            type: 'Column',
            tasks: getTasksForColumn(status.code),
            colorMain: status.colorMain,
            colorSub: status.colorSub || lightenColor(status.colorMain, 0.85),
            getSectionName,
          }
        }
      } else {
        const section = orderedSections.find(s => s.sectionId === columnId);
        if (section) {
          columnData = {
            id: section.sectionId,
            title: section.sectionName,
            type: 'Column',
            tasks: getTasksForColumn(section.sectionId),
            getSectionName,
          };
        }
      }
      setActiveColumn(columnData);
      setActiveTask(null);
    }
  };

  const handleDragCancel = () => { setActiveTask(null); setActiveColumn(null); };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    const type = active.data.current?.type;

    setActiveTask(null);
    setActiveColumn(null);

    if (!over) return;

    // 작업 드래그
    if (type === 'Task') {
      if (active.id === over.id) return;

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

      const isOverAColumn = over.data.current?.type === 'Column' || (
        viewMode === ViewModes.STATUS
          ? orderedStatusList.some(s => s.code === overId)
          : orderedSections.some(s => s.sectionId === overId)
      );

      let newTasks = [...currentTasks];

      if (isOverAColumn) {
        // 컬럼 위로 드롭 (Task를 빈 컬럼 또는 컬럼의 빈 공간으로 이동)
        const targetColumnId = overId;

        const finalTargetColumnId = over.data.current?.type === 'Column'
          ? overId
          : getColumnId(currentTasks.find(t => t.taskId === overId)!) ?? overId;

        if (activeColumnId !== finalTargetColumnId) {
          const updatedTask = { ...originalActiveTaskData };
          if (viewMode === ViewModes.STATUS) {
            const newStatus = orderedStatusList.find(s => s.code === finalTargetColumnId);
            if (!newStatus) return;
            updatedTask.status = newStatus;
          } else {
            const newSection = orderedSections.find(s => s.sectionId === finalTargetColumnId);
            if (!newSection) return;
            updatedTask.sectionId = finalTargetColumnId;
          }

          const tasksInTargetColumn = newTasks
            .filter(t => getColumnId(t) === finalTargetColumnId && t.taskId !== activeTaskId)
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
        // 다른 Task 위로 드롭
        const overTaskId = overId;
        const overTaskIndex = newTasks.findIndex(t => t.taskId === overTaskId);
        if (overTaskIndex === -1) {
          console.error("Over task not found in current tasks");
          return;
        }
        const overTask = newTasks[overTaskIndex];
        const overColumnId = getColumnId(overTask);

        if (activeColumnId === overColumnId) {
          // 같은 컬럼 내 task 순서 변경
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
          // 다른 컬럼의 Task 위로 이동
          const targetColumnId = overColumnId;
          const updatedTask = { ...originalActiveTaskData };

          if (viewMode === ViewModes.STATUS) {
            const newStatus = orderedStatusList.find(s => s.code === targetColumnId);
            if (!newStatus) return;
            updatedTask.status = newStatus;
          } else {
            const newSection = orderedSections.find(s => s.sectionId === targetColumnId);
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

            // 대상 컬럼: 드롭된 위치 이후 작업들의 순서를 1씩 증가
            if (colId === targetColumnId && currentOrder >= overTaskOrder) {
              targetColumnUpdates.set(t.taskId, currentOrder + 1);
            } else if (colId === activeColumnId && currentOrder > (originalActiveTaskData.order ?? 0)) {
              // 원본 컬럼: 드래그된 작업 이후 작업들의 순서를 1씩 감소
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
    } else if (type === 'Column') {
      // 컬럼 드래그 종료 처리
      const activeColumnId = active.id as string;
      const overColumnId = over.id as string;

      if (activeColumnId === overColumnId) return;

      if (viewMode === ViewModes.STATUS) {
        const oldIndex = orderedStatusList.findIndex(s => s.code === activeColumnId);
        const newIndex = orderedStatusList.findIndex(s => s.code === overColumnId);
        if (oldIndex !== -1 && newIndex !== -1)
          setOrderedStatusList(prev => arrayMove(prev, oldIndex, newIndex));
      } else {
        const oldIndex = orderedSections.findIndex(s => s.sectionId === activeColumnId);
        const newIndex = orderedSections.findIndex(s => s.sectionId === overColumnId);
        if (oldIndex !== -1 && newIndex !== -1)
          setOrderedSections(prev => arrayMove(prev, oldIndex, newIndex));
      }
    }

  };
  return {
    sensors,
    activeTask,
    activeColumn,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};