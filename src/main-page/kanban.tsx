import { useEffect } from "react";
import SectionComponent from "../component/kanban/column/column-list";
import { Section, SelectOption, Task } from "../types/type";
import { DndContext, DragOverlay, rectIntersection } from "@dnd-kit/core";
import useViewModeStore from "../store/viewmode-store";
import { ViewModes } from "../constants";
import useTaskStore from "../store/task-store";
import { useKanbanDnd } from "../hooks/use-task-dnd";
import DroppableColumn from "../component/kanban/column/droppable-column";
import useStatusesStore from "../store/statuses-store";
import useSectionsStore from "../store/sections-store";
import CardWrapper from "../component/kanban/card/card-wrapper";

const Kanban: React.FC<{
  tasks: Task[];
  sections: Section[];
  statusList: SelectOption[];
}> = ({ tasks: initialTasks, sections: initialSections, statusList: initialStatusList }) => {
  const { viewMode, setViewMode } = useViewModeStore();
  const setTasks = useTaskStore(state => state.setTasks);

  const sections = useSectionsStore(state => state.sections);
  const setSections = useSectionsStore(state => state.setSections);
  const setStatusList = useStatusesStore(state => state.setStatusList);
  const sectionsLoaded = useSectionsStore(state => state.sections.length > 0);
  const statusesLoaded = useStatusesStore(state => state.statusList.length > 0);

  const {
    sensors, activeTask, activeColumn, handleDragStart, handleDragEnd, handleDragCancel
  } = useKanbanDnd();

  useEffect(() => {
    if (initialTasks.length > 0) {
      const sortedTasks = initialTasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setTasks(sortedTasks);
    }
  }, [initialTasks, setTasks]);

  useEffect(() => {
    if (!sectionsLoaded) {
      const sortedSections = initialSections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setSections(sortedSections);
    }
  }, [initialSections, setSections, sectionsLoaded]);

  useEffect(() => {
    if (!statusesLoaded) {
      setStatusList(initialStatusList);
    }
  }, [initialStatusList, setStatusList, statusesLoaded]);

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
          {viewMode === ViewModes.STATUS ? '섹션별로 보기' : '상태별로 보기'}
        </div>
        <SectionComponent

          getSectionName={getSectionName}
        />
        <DragOverlay>
          {activeTask ? (
            <CardWrapper task={activeTask} sectionName={getSectionName(activeTask.sectionId)} isOverlay={true} />
          ) : activeColumn ? (
            <DroppableColumn
              id={activeColumn.id}
              title={activeColumn.title}
              tasks={activeColumn.tasks}
              getSectionName={activeColumn.getSectionName}
              colorMain={activeColumn.colorMain}
              colorSub={activeColumn.colorSub}
              isOverlay={true}
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default Kanban;