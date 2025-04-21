import { useDroppable } from "@dnd-kit/core";
import { Section, SelectOption, Task } from "../../types/type";
import CardWrapper from "./card-wrapper";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import useViewModeStore from "../../store/viewmode-store";

const DroppableColumn: React.FC<{
  id: string;
  title: string;
  items: Task[];
  getSectionName: (sectionId: string) => string;
}> = ({ id, title, items, getSectionName }) => {
  const { setNodeRef } = useDroppable({ id });

  const style = {
    minHeight: '100px',
    paddingBottom: '10px',
  };

  const itemIds = items.map(item => item.taskId);

  return (
    <div ref={setNodeRef} className="kanban-section" style={style}>
      <div className="section-header">{title}</div>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy} id={id}>
        <div className="section-content">
          {items.map(t => (
            <CardWrapper key={t.taskId} task={t} sectionName={getSectionName(t.sectionId)} />
          ))}
          <div className="task-add">
            <FontAwesomeIcon icon={faPlus} style={{width: 13, height: 13}}/>
            <div>작업 추가</div>
          </div>
        </div>
      </SortableContext>
    </div>
  );
};

const SectionComponent: React.FC<{
  tasks: Task[];
  sections: Section[];
  statusList: SelectOption[];
  getSectionName: (sectionId: string) => string;
}> = ({ tasks, sections, statusList, getSectionName }) => {
  const viewMode = useViewModeStore(state => state.viewMode);

  const getTasksForColumn = (columnId: string): Task[] => {
    return tasks
      .filter(t => (viewMode ? t.status.code : t.sectionId) === columnId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  return (
    <div className="kanban-content">
      {viewMode ? (
        <>
          {statusList.map(status => {
            const columnTasks = getTasksForColumn(status.code);
            return (
              <DroppableColumn key={status.code} id={status.code} title={status.name} items={columnTasks} getSectionName={(getSectionName)} />
            );
          })}
        </>
      ) : (
        <>
          {sections.map(sec => {
            const columnTasks = getTasksForColumn(sec.sectionId);
            return (
              <DroppableColumn key={sec.sectionId} id={sec.sectionId} title={sec.sectionName} items={columnTasks} getSectionName={getSectionName} />
            )
          })}
        </>
      )}
    </div>
  );
};

export default SectionComponent;