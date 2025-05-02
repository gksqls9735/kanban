import { Task } from "../../../types/type";
import useViewModeStore from "../../../store/viewmode-store";
import useTaskStore from "../../../store/task-store";
import { ViewModes } from "../../../constants";
import { useEffect, useMemo, useState } from "react";
import { lightenColor } from "../../../utils/color-function";
import DroppableColumn from "./droppable-column";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import useSectionsStore from "../../../store/sections-store";
import useStatusesStore from "../../../store/statuses-store";
import ColumnCreate from "./column-create";
import { useToast } from "../../../context/toast-context";

interface ColumnData {
  id: string;
  title: string;
  tasks: Task[];
  colorMain?: string;
  colorSub?: string;
}

const Column: React.FC<{
  getSectionName: (sectionId: string) => string;
}> = ({ getSectionName }) => {
  const [isAddingSection, setIsAddingSection] = useState<boolean>(false);

  const { showToast } = useToast();
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

  const { columnsWithTasks, columnsWithoutTasks } = useMemo(() => {
    const baesColumns = viewMode === ViewModes.STATUS
      ? statusList.map(status => ({
        id: status.code,
        title: status.name,
        colorMain: status.colorMain,
        colorSub: status.colorSub || lightenColor(status.colorMain, 0.85),
      }))
      : sections.map(sec => ({
        id: sec.sectionId,
        title: sec.sectionName,
        colorMain: undefined,
        colorSub: undefined,
      }));

    const withTasks: ColumnData[] = [];
    const withoutTasks: ColumnData[] = [];

    baesColumns.forEach(col => {
      const columnTasks = getTasksForColumn(col.id);
      const columnData: ColumnData = { ...col, tasks: columnTasks };

      if (columnTasks.length > 0) {
        withTasks.push(columnData);
      } else {
        withoutTasks.push(columnData);
      }
    });
    return { columnsWithTasks: withTasks, columnsWithoutTasks: withoutTasks };
  }, [viewMode, statusList, sections, tasks]);
  columnsWithTasks

  const allColumnIds = useMemo(() => [
    ...columnsWithTasks.map(col => col.id),
    ...columnsWithoutTasks.map(col => col.id),
  ], [columnsWithTasks, columnsWithoutTasks]);

  const handleAddNewItem = (name: string, color?: string) => {
    if (name) {
      if (viewMode === ViewModes.STATUS && color) {
        addStatus({ name: name, colorMain: color, colorSub: lightenColor(color, 0.85) });
        showToast('상태가 등록 되었습니다.')
      } else if (viewMode === ViewModes.SECTION) {
        addSection(name);
        showToast('섹션이 추가 되었습니다.')
      }
      setIsAddingSection(false);
    }
  };

  const toggle = () => {
    setIsAddingSection(prev => !prev);
  };

  return (
    <SortableContext items={allColumnIds} strategy={horizontalListSortingStrategy}>
      <div className="kanban-content">
        {columnsWithTasks.map(col => (
          <DroppableColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={col.tasks}
            getSectionName={getSectionName}
            colorMain={col.colorMain}
            colorSub={col.colorSub}
          />
        ))}
        <div className="kanban-content__empty-columns-container">
          {columnsWithoutTasks.map(col => (
            <DroppableColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={col.tasks}
              getSectionName={getSectionName}
              colorMain={col.colorMain}
              colorSub={col.colorSub}
            />
          ))}
        </div>
        {isAddingSection && (
          <ColumnCreate viewMode={viewMode} isAdd={isAddingSection} onAdd={handleAddNewItem} toggle={toggle} />
        )}

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