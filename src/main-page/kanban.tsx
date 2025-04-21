import { useEffect, useState } from "react";
import SectionComponent from "../component/kanban/section";
import { Section, SelectOption, Task } from "../types/type";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, rectIntersection, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Card from "../component/kanban/card-wrapper";

const Kanban: React.FC<{
  tasks: Task[];
  sections: Section[];
  statusList: SelectOption[];
}> = ({ tasks: initialTasks, sections, statusList }) => {
  const [isStatusView, setIsStatusView] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const getColumnId = (task: Task) => {
    return isStatusView ? task.status.code : task.sectionId
  };

  const getSectionName = (sectionId: string): string => {
    return sections.find(sec => sec.sectionId === sectionId)?.sectionName || '';
  };

  const handleDragStart = (e: DragStartEvent) => {
    const { active } = e;
    const taskId = active.id as string;
    const task = tasks.find(t => t.taskId === taskId);
    if (task) setActiveTask(task);
  };

  const handleDragCancel = () => { setActiveTask(null); };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    setTasks(prevTasks => {
      const activeTaskIndex = prevTasks.findIndex(t => t.taskId === activeTaskId);
      if (activeTaskIndex === -1) return prevTasks;

      const originalActiveTaskData = prevTasks[activeTaskIndex];
      const activeColumnId = getColumnId(originalActiveTaskData);

      const isOverAColumn = isStatusView
        ? statusList.some(s => s.code === overId)
        : sections.some(s => s.sectionId === overId);

      let newTasks = [...prevTasks];

      if (isOverAColumn) {
        // 다른 컬럼의 빈 공간 또는 컬럼 자체 위로 드롭
        const targetColumnId = overId;
        if (activeColumnId !== targetColumnId) {
          const updatedTask = { ...originalActiveTaskData };
          if (isStatusView) {
            const newStatus = statusList.find(s => s.code === targetColumnId);
            if (newStatus) updatedTask.status = newStatus; else return prevTasks;
          } else {
            const newSection = sections.find(s => s.sectionId === targetColumnId);
            if (newSection) updatedTask.sectionId = targetColumnId; else return prevTasks;
          }

          const tasksInTargetColumn = newTasks
            .filter(t => getColumnId(t) === targetColumnId && t.taskId !== activeTaskId)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

          updatedTask.order = tasksInTargetColumn.length;

          newTasks = newTasks
            .filter(t => t.taskId !== activeTaskId)
            .map(t => {
              if (getColumnId(t) === activeColumnId && (t.order ?? 0) > (originalActiveTaskData.order ?? 0)) {
                return { ...t, order: (t.order ?? 0) - 1 };
              }
              return t;
            });
          newTasks.push(updatedTask);
        }
      } else {
        // 다른 테스크 위로 드롭
        const overTaskId = overId;
        const overTaskIndex = newTasks.findIndex(t => t.taskId === overTaskId);
        if (overTaskIndex === -1) return prevTasks;

        const overTask = newTasks[overTaskIndex];
        const overColumnId = getColumnId(overTask);

        // 같은 컬럼
        if (activeColumnId === overColumnId) {
          const tasksInColumn = newTasks
            .filter(t => getColumnId(t) === activeColumnId)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

          const oldIndex = tasksInColumn.findIndex(t => t.taskId === activeTaskId);
          const newIndex = tasksInColumn.findIndex(t => t.taskId === overTaskId);

          const reorderedTaskIds = arrayMove(tasksInColumn.map(t => t.taskId), oldIndex, newIndex);

          const columnUpdates = new Map<string, number>();
          reorderedTaskIds.forEach((taskId, index) => { columnUpdates.set(taskId, index) });

          newTasks = newTasks.map(t => {
            if (getColumnId(t) === activeColumnId && columnUpdates.has(t.taskId)) {
              return { ...t, order: columnUpdates.get(t.taskId)! };
            }
            return t;
          });
        } else {
          // 다른 컬럼
          const targetColumnId = overColumnId;
          const updatedTask = { ...originalActiveTaskData };

          if (isStatusView) {
            const newStatus = statusList.find(s => s.code === targetColumnId);
            if (newStatus) updatedTask.status = newStatus; else return prevTasks;
          } else {
            const newSection = sections.find(s => s.sectionId === targetColumnId);
            if (newSection) updatedTask.sectionId = targetColumnId; else return prevTasks;
          }

          const tasksInTargetColumn = newTasks
            .filter(t => getColumnId(t) === targetColumnId && t.taskId !== activeTaskId)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

          const overTaskOrder = overTask.order ?? 0;
          updatedTask.order = overTaskOrder;

          const targetColumnUpdates = new Map<string, number>();
          tasksInTargetColumn.forEach(t => {
            if (t.order ?? 0 >= overTaskOrder) targetColumnUpdates.set(t.taskId, (t.order ?? 0) + 1);
          });

          const sourceColumnUpdates = new Map<string, number>();
          newTasks
            .filter(t => getColumnId(t) === activeColumnId && t.taskId !== activeTaskId && (t.order ?? 0) > (originalActiveTaskData.order ?? 0))
            .forEach(t => { sourceColumnUpdates.set(t.taskId, (t.order ?? 0) - 1) });

          newTasks = newTasks
            .filter(t => t.taskId !== activeTaskId)
            .map(t => {
              if (targetColumnUpdates.has(t.taskId)) return { ...t, order: targetColumnUpdates.get(t.taskId)! };
              if (sourceColumnUpdates.has(t.taskId)) return { ...t, order: sourceColumnUpdates.get(t.taskId)! };
              return t;
            });
          newTasks.push(updatedTask);
        }
      }

      return sortTasks(newTasks);
    });

  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className='kanban'>
        <div onClick={() => setIsStatusView(prev => !prev)} style={{ cursor: 'pointer', marginBottom: '1rem', padding: '8px', border: '1px solid #ccc', display: 'inline-block' }}>
          {isStatusView ? '섹션별로 보기' : '상태별로 보기'}
        </div>
        <SectionComponent
          tasks={tasks}
          isStatusView={isStatusView}
          sections={sections}
          statusList={statusList}
          getSectionName={getSectionName}
        />
        <DragOverlay>
          {activeTask ? (
            <Card task={activeTask} sectionName={getSectionName(activeTask.sectionId)} />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default Kanban;