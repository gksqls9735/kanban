import { useDroppable } from "@dnd-kit/core";
import { Section, SelectOption, Task } from "../../types/type";
import Card from "./card-wrapper";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

const DroppableColumn: React.FC<{
  id: string;
  title: string;
  items: Task[];
  getSectionName: (sectionId: string) => string;
}> = ({ id, title, items, getSectionName }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

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
            <Card key={t.taskId} task={t} sectionName={getSectionName(t.sectionId)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const SectionComponent: React.FC<{
  tasks: Task[];
  isStatusView: boolean;
  sections: Section[];
  statusList: SelectOption[];
  getSectionName: (sectionId: string) => string;
}> = ({ tasks, isStatusView, sections, statusList, getSectionName }) => {

  const getTasksForColumn = (columnId: string): Task[] => {
    return tasks
      .filter(t => (isStatusView ? t.status.code : t.sectionId) === columnId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  return (
    <div className="kanban-content">
      {isStatusView ? (
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
              <DroppableColumn key={sec.sectionId} id={sec.sectionId} title={sec.sectionName} items={columnTasks} getSectionName={getSectionName}/>
            )
          })}
        </>
      )}
    </div>
  );
};

export default SectionComponent;