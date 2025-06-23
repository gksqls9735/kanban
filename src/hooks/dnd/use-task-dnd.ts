import { useMemo, useState } from "react";
import useTaskStore from "../../store/task-store";
import useViewModeStore from "../../store/viewmode-store";
import { DragEndEvent, DragOverEvent, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ViewModes } from "../../constants";
import { lightenColor } from "../../utils/color-function";
import useSectionsStore from "../../store/sections-store";
import useStatusesStore from "../../store/statuses-store";
import useUserStore from "../../store/user-store";
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
  const setTasks = useTaskStore(state => state.setTasks);

  const { sections, setSections } = useSectionsStore();
  const { statusList, setStatusList } = useStatusesStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ActiveColumnData | null>(null);

  const [placeholderData, setPlaceholderData] = useState<{ columnId: string; index: number } | null>(null);
  const [draggedItemOriginalColumnId, setDraggedItemOriginalColumnId] = useState<string | null>(null);

  const { onTasksChange, onSectionsChange, onStatusesChange } = useKanbanActions();

  const currentUser = useUserStore(state => state.currentUser);

  const isOnwerOrParticipant = useMemo(() => {
    if (!currentUser) return false;
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
    useSensor(KeyboardSensor)
  );

  const getColumnId = (task: Task): string => {
    return viewMode === ViewModes.STATUS ? (task.status?.code || '') : (task.sectionId || '');
  };

  const getTasksForColumn = (columnId: string, excludeTaskId?: string): Task[] => {
    return allTasks
    .filter(t => {
      const matchesColumn = (viewMode === ViewModes.STATUS ? (t.status?.code || '') : (t.sectionId || '')) === columnId;
      return matchesColumn && t.taskId !== excludeTaskId;
    })
    .sort((a,b) => {
      if(viewMode === ViewModes.STATUS) return (a.statusOrder ?? 0) - (b.statusOrder ?? 0);
      return (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0);
    });
  };

  const getSectionName = (sectionId: string): string => {
    return sections.find(sec => sec.sectionId === sectionId)?.sectionName || '';
  };

  const handleDragStart = (e: DragStartEvent) => {
    const { active } = e;
    const type = active.data.current?.type as string;

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

    const tasksInTargetColumn = getTasksForColumn(targetColumnId, active.id as string);
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

    handleDragCancel();

    if (!over) return;

    const activeId = active.id as string;
    const activeType = active.data.current?.type as string;
    const overType = over.data.current?.type as string;

    if (activeType === 'Column') {
      let overColumnId: string;
      if (overType === 'Task' && over.data.current?.task) {
        const overTask = over.data.current.task as Task;
        overColumnId = getColumnId(overTask);
      } else if (overType === 'Column') {
        overColumnId = over.id as string;
      } else {
        return;
      }

      if (activeId === overColumnId) return;

      if (viewMode === ViewModes.STATUS) {
        const oldIdx = statusList.findIndex(s => s.code === activeId);
        let newIdx = statusList.findIndex(s => s.code === overColumnId);

        if (oldIdx !== -1 && newIdx !== -1) {
          const isTargetColumnWaiting = statusList[newIdx]?.name === '대기';
          const isActiveColumnWaiting = statusList[oldIdx]?.name === '대기';

          if (isTargetColumnWaiting && newIdx !== 0) newIdx = 1;
          if (!isActiveColumnWaiting && newIdx === 0 && statusList[0]?.name === '대기') newIdx = 1;

          if (isActiveColumnWaiting && newIdx !== 0) return;

          const movedList = arrayMove(statusList, oldIdx, newIdx);
          setStatusList(movedList);
          if (onStatusesChange) onStatusesChange(movedList);
        }
      } else {
        const oldIdx = sections.findIndex(sec => sec.sectionId === activeId);
        const newIdx = sections.findIndex(sec => sec.sectionId === overColumnId);
        if (oldIdx !== -1 && newIdx !== -1) {
          const movedList = arrayMove(sections, oldIdx, newIdx);
          const orderedSections = movedList.map((sec, idx) => ({ ...sec, order: idx, }));
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

      const prevAllTasks = [...allTasks];
      const originalColumnId = getColumnId(draggedTaskOriginal);

      let targetColumnId: string;
      let finalInsertIdx: number;

      if (over.data.current?.type === 'Column') {
        targetColumnId = over.id as string;
        // 컬럼에 드롭 시, 'placeholderData'가 있다면 해당 인덱스 사용, 없으면 맨 뒤;
        finalInsertIdx = placeholderData?.columnId === targetColumnId ? placeholderData.index : getTasksForColumn(targetColumnId).length;
      } else if (over.data.current?.type === 'Task' && over.data.current?.task) {
        const overTaskData = over.data.current.task as Task;
        targetColumnId = getColumnId(overTaskData);
        // 작업에 드롭 시, 'placeholderData'가 있다면 해당 인덱스 사용
        finalInsertIdx = placeholderData?.columnId === targetColumnId ? placeholderData.index : getTasksForColumn(targetColumnId).findIndex(t => t.taskId === overTaskData.taskId);
        if (finalInsertIdx === -1) finalInsertIdx = getTasksForColumn(targetColumnId).length;
      } else {
        return;
      }

      // 최종적으로 업데이트될 allTasks 배열을 만들기 위한 Map
      const nextAllTasksMap = new Map<string, Task>();

      // 같은 컬럼 내에서 드롭하는 경우
      if (originalColumnId === targetColumnId) {
        const tasksInCurrentColumn = getTasksForColumn(originalColumnId); // 현재 컬럼의 정렬된 작업들
        const oldIdxInColumn = tasksInCurrentColumn.findIndex(t => t.taskId === activeId);

        const updatedTasksInColumn = arrayMove(tasksInCurrentColumn, oldIdxInColumn, finalInsertIdx);

        // 순서 업데이트
        updatedTasksInColumn.forEach((t, idx) => {
          const updatedTask = { ...t };
          if (viewMode === ViewModes.STATUS) {
            updatedTask.statusOrder = idx;
          } else {
            updatedTask.sectionOrder = idx;
          }
          nextAllTasksMap.set(updatedTask.taskId, updatedTask);
        });

        prevAllTasks.filter(t => getColumnId(t) !== originalColumnId)
          .forEach(t => nextAllTasksMap.set(t.taskId, t));
      } else {
        // 다른 컬럼으로 이동하는 경우
        const updatedDraggedTask = { ...draggedTaskOriginal };

        if (viewMode === ViewModes.STATUS) {
          const targetStatus = statusList.find(s => s.code === targetColumnId);
          if (!targetStatus) return;
          updatedDraggedTask.status = targetStatus;
        } else {
          updatedDraggedTask.sectionId = targetColumnId;
        }

        // 원래 컬럼의 작업을 순서 업데이트
        let tasksInOriginalAfterMove = prevAllTasks
          .filter(t => getColumnId(t) === originalColumnId && t.taskId !== activeId)
          .sort((a, b) => {
            if (viewMode === ViewModes.STATUS) return (a.statusOrder ?? 0) - (b.statusOrder ?? 0);
            return (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0);
          });
        tasksInOriginalAfterMove.forEach((t, idx) => {
          const updatedTask = { ...t };
          if (viewMode === ViewModes.STATUS) {
            updatedTask.statusOrder = idx;
          } else {
            updatedTask.sectionOrder = idx;
          }
          nextAllTasksMap.set(updatedTask.taskId, updatedTask);
        });

        let tasksInTargetBeforeInsert = prevAllTasks
          .filter(t => getColumnId(t) === targetColumnId && t.taskId !== activeId)
          .sort((a, b) => {
            if (viewMode === ViewModes.STATUS) return (a.statusOrder ?? 0) - (b.statusOrder ?? 0);
            return (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0);
          });

        finalInsertIdx = Math.max(0, Math.min(finalInsertIdx, tasksInTargetBeforeInsert.length));
        tasksInTargetBeforeInsert.splice(finalInsertIdx, 0, updatedDraggedTask);

        tasksInTargetBeforeInsert.forEach((t, idx) => {
          const updatedTask = { ...t };
          if (viewMode === ViewModes.STATUS) {
            updatedTask.statusOrder = idx;
          } else {
            updatedTask.sectionOrder = idx;
          }
          nextAllTasksMap.set(updatedTask.taskId, updatedTask);
        });

        prevAllTasks.filter(t => getColumnId(t) !== originalColumnId && getColumnId(t) !== targetColumnId)
          .forEach(t => nextAllTasksMap.set(t.taskId, t));
      }

      const finalTasks = Array.from(nextAllTasksMap.values());
      setTasks(finalTasks);

      if (onTasksChange) {
        const changedTasks: Task[] = [];
        const finalTaskMap = new Map(finalTasks.map(t => [t.taskId, t]));

        prevAllTasks.forEach(t => {
          const currentTask = finalTaskMap.get(t.taskId);
          if (currentTask) {
            let isChanged = false;

            if (viewMode === ViewModes.STATUS) {
              if (t.statusOrder !== currentTask.statusOrder || t.status?.code !== currentTask.status?.code) {
                isChanged = true;
              }
            } else { // ViewModes.SECTION
              if (t.sectionOrder !== currentTask.sectionOrder || t.sectionId !== currentTask.sectionId) {
                isChanged = true;
              }
            }
            if (isChanged) changedTasks.push(currentTask);
          }
        });

        const activeTaskFinal = finalTaskMap.get(activeId);
        if (activeTaskFinal && !changedTasks.some(t => t.taskId === activeId)) {
          const originalActiveTask = prevAllTasks.find(t => t.taskId === activeId);
          if (originalActiveTask) {
            let isColumnMoved = false;
            if (viewMode === ViewModes.STATUS && originalActiveTask.status?.code !== activeTaskFinal.status?.code) isColumnMoved = true;
            if (viewMode === ViewModes.SECTION && originalActiveTask.sectionId !== activeTaskFinal.sectionId) isColumnMoved = true;

            let orderChanged = false;
            if (viewMode === ViewModes.STATUS && originalActiveTask.statusOrder !== activeTaskFinal.statusOrder) orderChanged = true;
            if (viewMode === ViewModes.SECTION && originalActiveTask.sectionOrder !== activeTaskFinal.sectionOrder) orderChanged = true;

            if (isColumnMoved || orderChanged) changedTasks.push(activeTaskFinal);
          }
        }

        if (changedTasks.length > 0) onTasksChange(changedTasks);
      }
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