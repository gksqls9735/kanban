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

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="white" strokeWidth="1.28" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const colors = [
  '#FF517A', '#F79009', '#91C21E', '#16B364', '#1EB2A1',
  '#0BA5EC', '#5F6B7A', '#4E5BA6', '#7A5AF8', '#9E7E26',
]


const Column: React.FC<{
  getSectionName: (sectionId: string) => string;
}> = ({ getSectionName }) => {
  const [isAddingSection, setIsAddingSection] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>(colors[0])
  const inputRef = useRef<HTMLInputElement>(null);

  const viewMode = useViewModeStore(state => state.viewMode);
  const tasks = useTaskStore(state => state.allTasks);
  const statusList = useStatusesStore(state => state.statusList);
  const addStatus = useStatusesStore(state => state.addStatus);
  const sections = useSectionsStore(state => state.sections);
  const addSection = useSectionsStore(state => state.addSection);

  useEffect(() => {
    if (isAddingSection && inputRef.current) {
      inputRef.current.focus();
      setSelectedColor(colors[0]);
    }
  }, [isAddingSection]);

  useEffect(() => {
    setIsAddingSection(false);
  }, [viewMode]);

  const getTasksForColumn = (columnId: string): Task[] => {
    return tasks
      .filter(t => (viewMode === ViewModes.STATUS ? t.status.code : t.sectionId) === columnId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const columnIds = useMemo(() => ( // useMemo 사용 추천
    viewMode === ViewModes.STATUS
      ? statusList.map(status => status.code)
      : sections.map(sec => sec.sectionId)
  ), [viewMode, statusList, sections]);

  const handleAdd = () => {
    const name = inputRef.current?.value.trim();
    if (name) {
      if (viewMode === ViewModes.STATUS) {
        addStatus({ name: name, colorMain: selectedColor, colorSub: lightenColor(selectedColor, 0.85) });
      } else {
        addSection(name);
      }
      setIsAddingSection(false);
    } else {
      inputRef.current?.focus();
    }
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const placeholderTxt = useMemo(() => viewMode === ViewModes.STATUS ? '상태명' : '섹션명', [viewMode]);

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
        {isAddingSection && (
          <div>
            <div className="new-section">
              <input ref={inputRef} type="text" placeholder={placeholderTxt} onKeyDown={handleInputSubmit} />
              <div className="create-confirm-button" onClick={handleAdd}>확인</div>
            </div>
            {viewMode === ViewModes.STATUS && (
              <div className="new-section__color-picker">
                <span className="new-section__color-picker-title">컬러 선택</span>
                <div className="new-section__color-swatches">
                  {colors.map(color => (
                    <div
                      key={color}
                      className="new-section__color-swatch"
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && <CheckIcon />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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