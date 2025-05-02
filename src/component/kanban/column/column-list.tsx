import { SelectOption, Task } from "../../../types/type";
import useViewModeStore from "../../../store/viewmode-store";
import useTaskStore from "../../../store/task-store";
import { colors, ViewModes } from "../../../constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import { lightenColor } from "../../../utils/color-function";
import DroppableColumn from "./droppable-column";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import useSectionsStore from "../../../store/sections-store";
import useStatusesStore from "../../../store/statuses-store";
import ColumnCreate from "./column-create";
import { useToast } from "../../../context/toast-context";
import { generateUniqueId } from "../../../utils/text-function";
import useUserStore from "../../../store/user-store";

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
  const insertStatus = useStatusesStore(state => state.insertStatus);

  const sections = useSectionsStore(state => state.sections);
  const addSection = useSectionsStore(state => state.addSection);
  const insertSection = useSectionsStore(state => state.insertSection);

  const currentUser = useUserStore(state => state.currentUser);

  const getAllUniqueUserIds = useCallback(() => {
    const allIds = tasks.flatMap(t => {
      const onwerId = t.taskOwner ? [t.taskOwner.id] : [];
      const participantIds = t.participants ? t.participants.map(p => p.id) : [];
      return [...onwerId, ...participantIds];
    });

    const uniqueIds = new Set(allIds);

    return Array.from(uniqueIds);
  }, [tasks]);

  const uniqueUserIds = useMemo(() => getAllUniqueUserIds(), [getAllUniqueUserIds]);
  const isOwnerOrParticipant = useMemo(() => uniqueUserIds.some(uId => uId === currentUser!.id), [uniqueUserIds]);

  useEffect(() => {
    setIsAddingSection(false);
  }, [viewMode]);

  const getTasksForColumn = (columnId: string): Task[] => {
    return tasks
      .filter(t => (viewMode === ViewModes.STATUS ? t.status.code : t.sectionId) === columnId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const { columnsWithTasks, columnsWithoutTasks, baseColumns } = useMemo(() => {
    const baseColumns = viewMode === ViewModes.STATUS
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

    baseColumns.forEach(col => {
      const columnTasks = getTasksForColumn(col.id);
      const columnData: ColumnData = { ...col, tasks: columnTasks };

      if (columnTasks.length > 0) {
        withTasks.push(columnData);
      } else {
        withoutTasks.push(columnData);
      }
    });
    return { columnsWithTasks: withTasks, columnsWithoutTasks: withoutTasks, baseColumns };
  }, [viewMode, statusList, sections, tasks]);

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

  const handleAddBefore = useCallback((referenceId: string) => {
    if (viewMode === ViewModes.SECTION) {
      insertSection(referenceId, 'before');
    } else if (viewMode === ViewModes.STATUS) {
      const newColor = colors[0];
      const newStatusData: SelectOption = {
        code: generateUniqueId('status'),
        name: '제목 없는 상태',
        colorMain: newColor,
        colorSub: lightenColor(newColor, 0.85),
      }
      insertStatus(referenceId, newStatusData, 'before');
    }
  }, [viewMode, insertSection]);

  const handleAddAfter = useCallback((referenceId: string) => {
    if (viewMode === ViewModes.SECTION) {
      insertSection(referenceId, 'after');
    } else if (viewMode === ViewModes.STATUS) {
      const newColor = colors[0];
      const newStatusData: SelectOption = {
        code: generateUniqueId('status'),
        name: '제목 없는 상태',
        colorMain: newColor,
        colorSub: lightenColor(newColor, 0.85),
      }
      insertStatus(referenceId, newStatusData, 'after');
    }
  }, [viewMode, insertSection]);

  return (
    <SortableContext items={allColumnIds} strategy={horizontalListSortingStrategy}>
      <div className="kanban-content">
        {baseColumns.map(col => (
          <DroppableColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={getTasksForColumn(col.id)}
            getSectionName={getSectionName}
            colorMain={col.colorMain}
            colorSub={col.colorSub}
            onAddBefore={handleAddBefore}
            onAddAfter={handleAddAfter}
          />
        ))}
        {/* {columnsWithTasks.map(col => (
          <DroppableColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={col.tasks}
            getSectionName={getSectionName}
            colorMain={col.colorMain}
            colorSub={col.colorSub}
            onAddBefore={handleAddBefore}
            onAddAfter={handleAddAfter}
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
              onAddBefore={handleAddBefore}
              onAddAfter={handleAddAfter}
            />
          ))}
        </div> */}
        {isAddingSection && isOwnerOrParticipant && (
          <ColumnCreate viewMode={viewMode} isAdd={isAddingSection} onAdd={handleAddNewItem} toggle={toggle} />
        )}

        {isOwnerOrParticipant && (
          <div className="add-section-button" onClick={() => setIsAddingSection(prev => !prev)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#7d8998" className="bi bi-plus-lg" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
            </svg>
          </div>
        )}
      </div>
    </SortableContext >
  );
};

export default Column;