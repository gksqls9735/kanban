import { Task } from "../../../types/type";
import useViewModeStore from "../../../store/viewmode-store";
import useTaskStore from "../../../store/task-store";
import { ViewModes } from "../../../constants";
import { useEffect, useMemo, useRef, useState } from "react";
import { lightenColor } from "../../../utils/color-function";
import DroppableColumn from "./droppable-column";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import useSectionsStore from "../../../store/sections-store";
import useStatusesStore from "../../../store/statuses-store";
import ColumnCreate from "./column-create";

const Column: React.FC<{
  getSectionName: (sectionId: string) => string;
}> = ({ getSectionName }) => {
  const [isAddingSection, setIsAddingSection] = useState<boolean>(false);

  const viewMode = useViewModeStore(state => state.viewMode);
  const tasks = useTaskStore(state => state.allTasks);
  const statusList = useStatusesStore(state => state.statusList);
  const addStatus = useStatusesStore(state => state.addStatus);
  const sections = useSectionsStore(state => state.sections);
  const addSection = useSectionsStore(state => state.addSection);

  useEffect(() => {
    setIsAddingSection(false);
  }, [viewMode]);

  const getTasksForColumn = (columnId: string): Task[] => {
    return tasks
      .filter(t => (viewMode === ViewModes.STATUS ? t.status.code : t.sectionId) === columnId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const columnIds = useMemo(() => (
    viewMode === ViewModes.STATUS
      ? statusList.map(status => status.code)
      : sections.map(sec => sec.sectionId)
  ), [viewMode, statusList, sections]);

  const handleAddNewItem = (name: string, color?: string) => {
    if (name) {
      if (viewMode === ViewModes.STATUS && color) {
        addStatus({ name: name, colorMain: color, colorSub: lightenColor(color, 0.85) });
      } else if (viewMode === ViewModes.SECTION) {
        addSection(name);
      }
      setIsAddingSection(false);
    }
  };

  const toggleEditing = () => {
    setIsAddingSection(prev => !prev);
  };

  return (
    <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
      <div className="kanban-content">
        {viewMode === ViewModes.STATUS ? (
          <>
            {statusList.map(status => {
              const columnTasks = getTasksForColumn(status.code);
              return (
                <DroppableColumn key={status.code} id={status.code} title={status.name} tasks={columnTasks}
                  getSectionName={(getSectionName)} colorMain={status.colorMain} colorSub={status.colorSub || lightenColor(status.colorMain, 0.85)} />
              );
            })}
          </>
        ) : (
          <>
            {sections.map(sec => {
              const columnTasks = getTasksForColumn(sec.sectionId);
              return (
                <DroppableColumn key={sec.sectionId} id={sec.sectionId} title={sec.sectionName} tasks={columnTasks} getSectionName={getSectionName} />
              )
            })}
          </>
        )}
        <ColumnCreate viewMode={viewMode} isAdd={isAddingSection} onAdd={handleAddNewItem} toggleEditing={toggleEditing}/>
        <div className="add-section-button" onClick={() => setIsAddingSection(prev => !prev)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#7d8998" className="bi bi-plus-lg" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
          </svg>
        </div>
      </div>
    </SortableContext >
  );
};

export default Column;