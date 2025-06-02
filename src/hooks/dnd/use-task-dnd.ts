import { useMemo, useState } from "react";
import useTaskStore from "../../store/task-store"; // 실제 경로로 수정 필요
import useViewModeStore from "../../store/viewmode-store"; // 실제 경로로 수정 필요
import { DragEndEvent, DragOverEvent, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ViewModes } from "../../constants"; // 실제 경로로 수정 필요
import { lightenColor } from "../../utils/color-function"; // 실제 경로로 수정 필요
import useSectionsStore from "../../store/sections-store"; // 실제 경로로 수정 필요
import useStatusesStore from "../../store/statuses-store"; // 실제 경로로 수정 필요
import useUserStore from "../../store/user-store"; // 실제 경로로 수정 필요
import { Task } from "../../types/type";
import { useKanbanActions } from "../../context/task-action-context";

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
  const setTasks = useTaskStore(state => state.setTasks); // Zustand 스토어의 setTasks 액션

  const { sections, setSections } = useSectionsStore();
  const { statusList, setStatusList } = useStatusesStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ActiveColumnData | null>(null);

  const [placeholderData, setPlaceholderData] = useState<{ columnId: string; index: number } | null>(null);
  const [draggedItemOriginalColumnId, setDraggedItemOriginalColumnId] = useState<string | null>(null);

  const { onTasksChange, onSectionsChange, onStatusesChange } = useKanbanActions();

  const currentUser = useUserStore(state => state.currentUser);

  const isOnwerOrParticipant = useMemo(() => {
    if (!currentUser) return false; // currentUser가 없으면 참여자가 아님
    const allIds = allTasks.flatMap(t => {
      const ownerId = t.taskOwner ? [t.taskOwner.id] : [];
      const participantIds = t.participants ? t.participants.map(p => p.id) : [];
      return [...ownerId, ...participantIds];
    });
    const uniqueIds = new Set(allIds);
    return Array.from(uniqueIds).some(uId => uId === currentUser.id);
  }, [allTasks, currentUser]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8, }
    }),
    useSensor(KeyboardSensor) // sortableKeyboardCoordinates는 @dnd-kit/sortable과 함께 사용 시 필요
  );

  const getColumnId = (task: Task): string => {
    // Task 타입에 status.code와 sectionId가 있다고 가정
    return viewMode === ViewModes.STATUS ? (task.status?.code || '') : (task.sectionId || '');
  };

  // --- 수정된 getTasksForColumn ---
  const getTasksForColumn = (columnId: string): Task[] => {
    return allTasks
      .filter(t => (viewMode === ViewModes.STATUS ? (t.status?.code || '') : (t.sectionId || '')) === columnId)
      .sort((a, b) => {
        if (viewMode === ViewModes.STATUS) {
          return (a.statusOrder ?? 0) - (b.statusOrder ?? 0); // STATUS 모드일 때는 statusOrder로 정렬
        } else { // ViewModes.SECTION
          return (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0); // SECTION 모드일 때는 sectionOrder로 정렬
        }
      });
  };

  const getSectionName = (sectionId: string): string => {
    return sections.find(sec => sec.sectionId === sectionId)?.sectionName || '';
  };

  const handleDragStart = (e: DragStartEvent) => {
    const { active } = e;
    const type = active.data.current?.type as string; // 타입 명시

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
      } else { // ViewModes.SECTION
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

    if (!over || !activeTask || active.id === over.id) {
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

    const tasksInTargetColumn = getTasksForColumn(targetColumnId);
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

  // --- 수정된 handleDragEnd ---
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

    const activeType = active.data.current?.type as string; // 타입 명시
    const overType = over.data.current?.type as string; // 타입 명시

    if (activeType === 'Column') {
      if (overType === 'Task' && over.data.current?.task) {
        const overTask = over.data.current.task as Task;
        overId = getColumnId(overTask);
      } else if (overType !== 'Column') {
        return;
      }

      if (activeId === overId) return;

      if (viewMode === ViewModes.STATUS) {
        const oldIndex = statusList.findIndex(s => s.code === activeId);
        let newIndex = statusList.findIndex(s => s.code === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const isTargetColumnWaiting = statusList[newIndex]?.name === '대기'; // null 체크 추가
          const isActiveColumnWaiting = statusList[oldIndex]?.name === '대기'; // null 체크 추가

          if (isTargetColumnWaiting && newIndex !== 0) newIndex = 1;
          if (!isActiveColumnWaiting && newIndex === 0 && statusList[0]?.name === '대기') newIndex = 1; // null 체크 추가

          if (isActiveColumnWaiting && newIndex !== 0) return;

          const movedList = arrayMove(statusList, oldIndex, newIndex);
          setStatusList(movedList);
          if (onStatusesChange) onStatusesChange(movedList);
        }
      } else { // ViewModes.SECTION
        const oldIndex = sections.findIndex(sec => sec.sectionId === activeId);
        const newIndex = sections.findIndex(sec => sec.sectionId === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const movedList = arrayMove(sections, oldIndex, newIndex);
          const orderedSections = movedList.map((sec, index) => ({
            ...sec,
            order: index,
          }));
          setSections(orderedSections);
          if (onSectionsChange) onSectionsChange(orderedSections);
        }
      }
      return;
    }

    if (activeType === 'Task') {
      const draggedTaskOriginal = allTasks.find(t => t.taskId === activeId);
      if (!draggedTaskOriginal) {
        console.error("오류: 드래그된 작업을 찾을 수 없습니다.");
        return;
      }

      let targetColumnId: string;
      let visualIndexInTargetColumn: number;

      if (over.data.current?.type === 'Column') {
        targetColumnId = over.id as string;
        const tasksInTarget = allTasks.filter(t => getColumnId(t) === targetColumnId && t.taskId !== activeId);
        visualIndexInTargetColumn = tasksInTarget.length;
      } else if (over.data.current?.type === 'Task' && over.data.current?.task) {
        const overTaskData = over.data.current.task as Task;
        targetColumnId = getColumnId(overTaskData);

        const tasksCurrentlyInTarget = allTasks
          .filter(t => getColumnId(t) === targetColumnId && t.taskId !== activeId)
          .sort((a, b) => {
            if (viewMode === ViewModes.STATUS) return (a.statusOrder ?? 0) - (b.statusOrder ?? 0);
            return (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0);
          });

        const overTaskIndex = tasksCurrentlyInTarget.findIndex(t => t.taskId === overTaskData.taskId);
        if (overTaskIndex !== -1) {
          visualIndexInTargetColumn = overTaskIndex;
        } else {
          visualIndexInTargetColumn = tasksCurrentlyInTarget.length;
        }
      } else {
        return;
      }

      let tempTasks = allTasks.filter(t => t.taskId !== activeId);
      const updatedDraggedTask = { ...draggedTaskOriginal };

      if (viewMode === ViewModes.STATUS) {
        updatedDraggedTask.status = { ...(draggedTaskOriginal.status || {}), code: targetColumnId } as Task['status'];
      } else { // ViewModes.SECTION
        updatedDraggedTask.sectionId = targetColumnId;
      }

      let tasksInTarget = tempTasks
        .filter(t => getColumnId(t) === targetColumnId)
        .sort((a, b) => {
          if (viewMode === ViewModes.STATUS) return (a.statusOrder ?? 0) - (b.statusOrder ?? 0);
          return (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0);
        });

      visualIndexInTargetColumn = Math.max(0, Math.min(visualIndexInTargetColumn, tasksInTarget.length));
      tasksInTarget.splice(visualIndexInTargetColumn, 0, updatedDraggedTask);

      tasksInTarget.forEach((task, index) => {
        if (viewMode === ViewModes.STATUS) {
          task.statusOrder = index;
        } else { // ViewModes.SECTION
          task.sectionOrder = index;
        }
      });

      const originalColumnId = getColumnId(draggedTaskOriginal);
      let tasksInOriginal: Task[] = [];
      if (originalColumnId !== targetColumnId) {
        tasksInOriginal = tempTasks
          .filter(t => getColumnId(t) === originalColumnId)
          .sort((a, b) => {
            if (viewMode === ViewModes.STATUS) return (a.statusOrder ?? 0) - (b.statusOrder ?? 0);
            return (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0);
          });

        tasksInOriginal.forEach((task, index) => {
          if (viewMode === ViewModes.STATUS) {
            task.statusOrder = index;
          } else { // ViewModes.SECTION
            task.sectionOrder = index;
          }
        });
      }

      const finalTasksMap = new Map<string, Task>();
      allTasks.forEach(task => {
        if (task.taskId !== activeId && getColumnId(task) !== targetColumnId && getColumnId(task) !== originalColumnId) {
          finalTasksMap.set(task.taskId, task);
        }
      });

      tasksInTarget.forEach(task => {
        finalTasksMap.set(task.taskId, task);
      });

      if (originalColumnId !== targetColumnId) {
        tasksInOriginal.forEach(task => {
          finalTasksMap.set(task.taskId, task);
        });
      }

      const finalTasks = Array.from(finalTasksMap.values())
      setTasks(finalTasks);
      if (onTasksChange) onTasksChange(finalTasks);
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