import { useDroppable } from "@dnd-kit/core";
import { Section, SelectOption, Task } from "../../types/type";
import CardWrapper from "./card-wrapper";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import useViewModeStore from "../../store/viewmode-store";
import useTaskStore from "../../store/task-store";
import { ViewModes } from "../../constants";
import { useState } from "react";
import { lightenColor } from "../../utils/color-function";

const DroppableColumn: React.FC<{
  tasks: Task[];
  id: string;
  title: string;
  getSectionName: (sectionId: string) => string;
  colorMain?: string;
  colorSub?: string;
}> = ({ id, title, tasks, getSectionName, colorMain, colorSub }) => {
  const { setNodeRef } = useDroppable({ id });

  const style = {
    minHeight: '100px',
    paddingBottom: '10px',
  };

  const itemIds = tasks.map(item => item.taskId);

  const headerStyle: React.CSSProperties = {};
  if (colorMain && colorSub) {
    headerStyle.color = colorMain;
    headerStyle.border = `1px solid ${colorMain}`;
    headerStyle.backgroundColor = colorSub;
  }

  return (
    <div ref={setNodeRef} className="kanban-section" style={style}>
      <div className="section-header" style={headerStyle}>{title}</div>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy} id={id}>
        <div className="section-content">
          {tasks.map(t => (
            <CardWrapper key={t.taskId} task={t} sectionName={getSectionName(t.sectionId)} />
          ))}
          <div className="task-add">
            <FontAwesomeIcon icon={faPlus} style={{ width: 13, height: 13 }} />
            <div>작업 추가</div>
          </div>
        </div>
      </SortableContext>
    </div>
  );
};

const SectionComponent: React.FC<{
  sections: Section[];
  statusList: SelectOption[];
  getSectionName: (sectionId: string) => string;
}> = ({ sections, statusList, getSectionName }) => {
  const viewMode = useViewModeStore(state => state.viewMode);
  const tasks = useTaskStore(state => state.allTasks);
  const [newSectionCount, setNewSectionCount] = useState<number>(0);

  const getTasksForColumn = (columnId: string): Task[] => {
    return tasks
      .filter(t => (viewMode === ViewModes.STATUS ? t.status.code : t.sectionId) === columnId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  return (
    <div className="kanban-content">
      {viewMode === ViewModes.STATUS ? (
        <>
          {statusList.map(status => {
            const columnTasks = getTasksForColumn(status.code);
            return (
              <DroppableColumn key={status.code} id={status.code} title={status.name} tasks={columnTasks} 
                getSectionName={(getSectionName)} colorMain={status.colorMain} colorSub={status.colorSub || lightenColor(status.colorMain, 0.85)}/>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {Array.from({ length: newSectionCount }).map((_, index) => (
          <div key={index} className="new-section">
            <input type="text" placeholder="섹션명" />
            <div className="create-confirm-button">확인</div>
          </div>
        ))}
      </div>
      <div className="add-section-button" onClick={() => setNewSectionCount(prev => prev + 1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#7d8998" className="bi bi-plus-lg" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
        </svg>
      </div>
    </div>
  );
};

export default SectionComponent;