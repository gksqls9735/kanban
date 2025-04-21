import { Task } from "../../types/type";
import { lightenColor } from "../../utils/color-function";
import { formatKoreanDateSimple } from "../../utils/date-function";
import AvatarGroup from "../avatar/avatar-group";
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from "@dnd-kit/sortable";
import React from "react";
import CardContent from "./card-content";

const CardWrapper: React.FC<{
  task: Task;
  sectionName: string;
}> = ({ task, sectionName }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.taskId,
    data: {
      task: task, type: 'Task',
    }
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: 'grab',
    marginBottom: '8px',
    position: 'relative',
    backgroundColor: 'white',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="kanban-card"
    >
      <CardContent task={task} sectionName={sectionName}/>
    </div>
  );
};

export default CardWrapper;