import { useMemo, useState } from "react";
import useTaskStore from "../store/task-store";
import useViewModeStore from "../store/viewmode-store";
import { Task } from "../types/type";
import { DragEndEvent, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
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

  const currentUser = useUserStore(state => state.currentUser);

  const isOnwerOrParticipant = useMemo(() => {
    const allIds = allTasks.flatMap(t => {
      const onwerId = t.taskOwner ? [t.taskOwner.id] : [];
      const participantIds = t.participants ? t.participants.map(p => p.id) : [];
      return [...onwerId, ...participantIds];
    });

    const uniqueIds = new Set(allIds);
    const uniqueIdsArray = Array.from(uniqueIds);

    return uniqueIdsArray.some(uId => uId === currentUser?.id);

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
      if (task) setActiveTask(task);
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
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    setActiveColumn(null);

  };

  const handleDragEnd = (e: DragEndEvent) => {
    if (!isOnwerOrParticipant) {
      handleDragCancel();
      return;
    }

    const { active, over } = e;

    setActiveTask(null);
    setActiveColumn(null);

    if (!over) return;

    const activeId = active.id as string;
    let originalOverId = over.id as string;
    let overId = originalOverId;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'Column') {
      if (overType === 'Task') {
        const overTask = allTasks.find(t => t.taskId === originalOverId);
        if (overTask) {
          overId = getColumnId(overTask);
        } else {
          return;
        }
      }

      if (activeId === overId) return;

      if (viewMode === ViewModes.STATUS) {
        const oldIndex = statusList.findIndex(s => s.code === activeId);
        const newIndex = statusList.findIndex(s => s.code === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
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
      if (activeId === overId) return;

      const originalTask = allTasks.find(t => t.taskId === activeId);
      if (!originalTask) return;

      let targetColumnId: string;
      let overTaskData: Task | undefined | null = null;

      const isOverColumnDirectly = over.data.current?.type === 'Column' ||
        (viewMode === ViewModes.STATUS
          ? statusList.some(s => s.code === overId)
          : sections.some(s => s.sectionId === overId))

      if (isOverColumnDirectly) {
        targetColumnId = overId;
      } else {
        overTaskData = allTasks.find(t => t.taskId === overId);
        if (!overTaskData) return;
        targetColumnId = getColumnId(overTaskData);
      }

      const tasksInTargetColumn = allTasks
        .filter(t => getColumnId(t) === targetColumnId && t.taskId !== activeId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      let newOrder: number;

      if (overTaskData) {
        const overTaskIndex = tasksInTargetColumn.findIndex(t => t.taskId === overTaskData.taskId);
        const prevOrder = overTaskIndex > 0
          ? (tasksInTargetColumn[overTaskIndex - 1].order ?? 0)
          : 0;
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
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};