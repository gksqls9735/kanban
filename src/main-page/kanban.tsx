import { useEffect } from "react";
import SectionComponent from "../component/kanban/section";
import { Section, SelectOption, Task } from "../types/type";
import { DndContext, DragOverlay, rectIntersection } from "@dnd-kit/core";
import Card from "../component/kanban/card-wrapper";
import useViewModeStore from "../store/viewmode-store";
import { ViewModes } from "../constants";
import useTaskStore from "../store/task-store";
import { useKanbanDnd } from "../hooks/use-kanban-dnd";

const Kanban: React.FC<{
  tasks: Task[];
  sections: Section[];
  statusList: SelectOption[];
}> = ({ tasks: initialTasks, sections, statusList }) => {
  const { viewMode, setViewMode } = useViewModeStore();
  const setTasks = useTaskStore(state => state.setTasks);

  const { sensors, activeTask, handleDragStart, handleDragEnd, handleDragCancel } = useKanbanDnd(sections, statusList);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const getSectionName = (sectionId: string): string => {
    return sections.find(sec => sec.sectionId === sectionId)?.sectionName || '';
  };


  const toggleViewMode = () => {
    setViewMode(viewMode === ViewModes.STATUS ? ViewModes.SECTION : ViewModes.STATUS);
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
        <div onClick={toggleViewMode} style={{ cursor: 'pointer', marginBottom: '1rem', padding: '8px', border: '1px solid #ccc', display: 'inline-block' }}>
          {viewMode === ViewModes.STATUS? '섹션별로 보기' : '상태별로 보기'}
        </div>
        <SectionComponent
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