import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import CardWrapper from "./card-wrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Task } from "../../types/type";
import { CSS } from '@dnd-kit/utilities';
import { useState } from "react";
import NewTaskCard from "./new-task-card";

const DroppableColumn: React.FC<{
  tasks: Task[];
  id: string;
  title: string;
  getSectionName: (sectionId: string) => string;
  colorMain?: string;
  colorSub?: string;
  isOverlay?: boolean;
}> = ({ tasks, id, title, getSectionName, colorMain, colorSub, isOverlay }) => {
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging
  } = useSortable({ id: id, data: { type: 'Column', columnId: id } });

  const tasksId = tasks.map(item => item.taskId);

  const headerStyle: React.CSSProperties = {};
  if (colorMain && colorSub) {
    headerStyle.color = colorMain;
    headerStyle.border = `1px solid ${colorMain}`;
    headerStyle.backgroundColor = colorSub;
    headerStyle.cursor = isOverlay ? 'grabbing' : 'grab';
  }

  const columnStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    flexShrink: 0,
  };

  return (
    <div ref={setNodeRef} style={columnStyle} {...attributes} className="kanban-section">
      <div className="section-header" style={headerStyle} {...listeners}>{title}</div>
      <div className="section-content">
        <SortableContext items={tasksId} strategy={verticalListSortingStrategy}>
          {tasks.map(t => (
            <CardWrapper key={t.taskId} task={t} sectionName={getSectionName(t.sectionId)} />
          ))}
        </SortableContext>
        {isAddingTask && (<NewTaskCard columnId={id}/>)}
        <div className="task-add" onClick={() => setIsAddingTask(true)}>
          <FontAwesomeIcon icon={faPlus} style={{ width: 13, height: 13 }} />
          <div>작업 추가</div>
        </div>
      </div>
    </div>
  );
};

export default DroppableColumn;