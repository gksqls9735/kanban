import { useMemo, useState } from "react";
import useTaskStore from "../store/task-store";
import useViewModeStore from "../store/viewmode-store";
import { Task } from "../types/type";
import { DragEndEvent, DragOverEvent, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ViewModes } from "../constants";
import { lightenColor } from "../utils/color-function";
import useSectionsStore from "../store/sections-store";
import useStatusesStore from "../store/statuses-store";
import useUserStore from "../store/user-store";

export interface ActiveColumnData {
  id: string;
  title: string;
  type: 'Column'
  tasks: Task[];
  colorMain?: string;
  colorSub?: string;
  getSectionName: (sectionId: string) => string;
}


export const useKanbanDnd = () => {
  const { viewMode } = useViewModeStore();
  const allTasks = useTaskStore(state => state.allTasks);
  const updateTask = useTaskStore(state => state.updateTask);

  const { sections, setSections } = useSectionsStore();
  const { statusList, setStatusList } = useStatusesStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ActiveColumnData | null>(null);

  const [placeholderData, setPlaceholderData] = useState<{ columnId: string; index: number } | null>(null);
  const [draggedItemOriginalColumnId, setDraggedItemOriginalColumnId] = useState<string | null>(null);

  const currentUser = useUserStore(state => state.currentUser);

  const isOnwerOrParticipant = useMemo(() => {
    const allIds = allTasks.flatMap(t => {
      const onwerId = t.taskOwner ? [t.taskOwner.id] : [];
      const participantIds = t.participants ? t.participants.map(p => p.id) : [];
      return [...onwerId, ...participantIds];
    });
    const uniqueIds = new Set(allIds);
    return Array.from(uniqueIds).some(uId => uId === currentUser?.id);

  }, [allTasks, currentUser]);

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
    return sections.find(sec => sec.sectionId === sectionId)?.sectionName || '';
  };

  const handleDragStart = (e: DragStartEvent) => {
    const { active } = e;
    const type = active.data.current?.type;

    if (type === 'Task') {
      const taskId = active.id as string;
      const task = allTasks.find(t => t.taskId === taskId);
      if (task) {
        setActiveTask(task);
        setDraggedItemOriginalColumnId(getColumnId(task));
      }
      setActiveColumn(null);
    } else if (type === 'Column') {
      const columnId = active.id as string;
      let columnData: ActiveColumnData | null = null;
      if (viewMode === ViewModes.STATUS) {
        const status = statusList.find(s => s.code === columnId);
        if (status) {
          columnData = {
            id: status.code,
            title: status.name,
            type: 'Column',
            tasks: getTasksForColumn(status.code),
            colorMain: status.colorMain,
            colorSub: status.colorSub || lightenColor(status.colorMain, 0.85),
            getSectionName
          };
        }
      } else {
        const section = sections.find(s => s.sectionId === columnId);
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
    setPlaceholderData(null);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;

    if (!over || !activeTask || active.id === over.id) { // activeTask (currentDraggingTask 역할) 사용
      const overData = over?.data.current;
      let currentOverColumnId: string | null = null;
      if (overData?.type === 'Column') {
        currentOverColumnId = over!.id as string;
      } else if (overData?.type === 'Task' && overData.task) {
        currentOverColumnId = getColumnId(overData.task as Task);
      }
      if (currentOverColumnId === draggedItemOriginalColumnId) {
        setPlaceholderData(null);
      }
      return;
    }

    if (active.data.current?.type !== 'Task') {
      setPlaceholderData(null);
      return;
    }

    const overIsTask = over.data.current?.type === 'Task';
    const overIsColumn = over.data.current?.type === 'Column';

    let targetColumnId: string | null = null;
    if (overIsColumn) {
      targetColumnId = over.id as string;
    } else if (overIsTask && over.data.current?.task) {
      targetColumnId = getColumnId(over.data.current.task as Task);
    }

    if (!targetColumnId || targetColumnId === draggedItemOriginalColumnId) {
      setPlaceholderData(null);
      return;
    }

    const tasksInTargetColumn = getTasksForColumn(targetColumnId); // 내부 getTasksForColumn 사용
    let newIndex: number;

    if (overIsTask && over.data.current?.task) {
      const overTask = over.data.current.task as Task;
      const overTaskIndexInTargetColumn = tasksInTargetColumn.findIndex(t => t.taskId === overTask.taskId);
      if (overTaskIndexInTargetColumn === -1) {
        setPlaceholderData(null); return;
      }
      newIndex = overTaskIndexInTargetColumn;
    } else if (overIsColumn) {
      newIndex = tasksInTargetColumn.length;
    } else {
      setPlaceholderData(null); return;
    }
    setPlaceholderData({ columnId: targetColumnId, index: newIndex });
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    setActiveColumn(null);
    setPlaceholderData(null);
    setDraggedItemOriginalColumnId(null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    if (!isOnwerOrParticipant) {
      handleDragCancel();
      return;
    }

    const { active, over } = e;

    setActiveTask(null);
    setActiveColumn(null);
    setPlaceholderData(null);
    setDraggedItemOriginalColumnId(null);

    if (!over) return;

    const activeId = active.id as string;
    let originalOverId = over.id as string;
    let overId = originalOverId;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'Column') {
      if (overType === 'Task' && over.data.current?.task) { // over.data.current.task null 체크
        const overTask = over.data.current.task as Task; // 타입 단언
        overId = getColumnId(overTask); // 내부 getColumnId 사용
      } else if (overType !== 'Column') { // Task도 아니고 Column도 아니면 무시
        return;
      }

      if (activeId === overId) return;

      if (viewMode === ViewModes.STATUS) {
        const oldIndex = statusList.findIndex(s => s.code === activeId);
        let newIndex = statusList.findIndex(s => s.code === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const isColumnWaiting = statusList[newIndex].name === '대기';
          if (isColumnWaiting && newIndex !== 0) newIndex = 1;
          if (statusList[oldIndex].name !== '대기' && newIndex === 0 && statusList[0].name === '대기') newIndex = 1;
          if (statusList[activeId as any]?.name === '대기' && newIndex !== 0) return;
          setStatusList(arrayMove(statusList, oldIndex, newIndex));
        }
      } else {
        const oldIndex = sections.findIndex(sec => sec.sectionId === activeId);
        const newIndex = sections.findIndex(sec => sec.sectionId === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const movedList = arrayMove(sections, oldIndex, newIndex);
          const orderedSections = movedList.map((sec, index) => ({
            ...sec, order: index,
          }));
          setSections(orderedSections);
        }
      }
      return;
    }

    if (activeType === 'Task') {
      if (activeId === overId && active.data.current?.task && getColumnId(active.data.current.task as Task) === (over.data.current?.task ? getColumnId(over.data.current.task as Task) : over.id as string)) {
        if (activeId === overId) return;
      }

      const originalTask = allTasks.find(t => t.taskId === activeId);
      if (!originalTask) return;

      let targetColumnId: string;
      let overTaskData: Task | null = null;

      const isOverColumnDirectly = over.data.current?.type === 'Column' ||
        (viewMode === ViewModes.STATUS
          ? statusList.some(s => s.code === overId)
          : sections.some(s => s.sectionId === overId))

      if (isOverColumnDirectly) {
        targetColumnId = overId;
      } else if (over.data.current?.type === 'Task' && over.data.current?.task) { // over된 것이 Task인지 명확히 확인
        overTaskData = over.data.current.task as Task;
        targetColumnId = getColumnId(overTaskData); // 내부 getColumnId 사용
      } else { // 유효하지 않은 드롭 대상
        return;
      }

      const tasksInTargetColumn = allTasks
        .filter(t => getColumnId(t) === targetColumnId && t.taskId !== activeId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      let newOrder: number;

      if (overTaskData) {
        const overTaskIndex = tasksInTargetColumn.findIndex(t => t.taskId === overTaskData.taskId);
        const prevOrder = overTaskIndex > 0 ? (tasksInTargetColumn[overTaskIndex - 1].order ?? 0) : 0;
        const nextOrder = overTaskData.order ?? 0;
        newOrder = (prevOrder + nextOrder) / 2;
      } else {
        const lastTaskOrder = tasksInTargetColumn.length > 0
          ? (tasksInTargetColumn[tasksInTargetColumn.length = 1].order ?? 0)
          : 0;
        newOrder = lastTaskOrder + 1;
      }

      const attributeUpdate: Partial<Task> = {};
      const originalColumnId = getColumnId(originalTask);

      if (originalColumnId !== targetColumnId) {
        if (viewMode === ViewModes.STATUS) {
          const newStatus = statusList.find(s => s.code === targetColumnId);
          if (newStatus) attributeUpdate.status = newStatus;
          else return;
        } else {
          attributeUpdate.sectionId = targetColumnId;
        }
      }

      updateTask(activeId, { ...attributeUpdate, order: newOrder });

    }

  };
  return {
    sensors,
    activeTask,
    activeColumn,
    placeholderData,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
};