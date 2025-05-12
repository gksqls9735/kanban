import { CSS } from '@dnd-kit/utilities';
import { useSortable } from "@dnd-kit/sortable";
import React, { useState } from "react";
import CardContent from "./card-content";
import { Task } from '../../../types/type';
import UpdateCard from './update-card';

const CardWrapper: React.FC<{
  task: Task;
  sectionName: string;
  isOverlay?: boolean;
}> = ({ task, sectionName, isOverlay }) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState<boolean>(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.taskId,
    data: {
      task: task, type: 'Task',
    },
    disabled: isAnyModalOpen,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    marginBottom: '8px',
    position: 'relative',
    backgroundColor: 'white',
    cursor: isAnyModalOpen ? 'default' : (isOverlay ? 'grabbing' : 'grab'),
  };

  const handleModalStateChange = (isOpen: boolean) => {
    setIsAnyModalOpen(isOpen);
  };

  return (
    <>
      {isEdit ? (
        <div
          className="kanban-card"
        >
          <UpdateCard onClose={() => setIsEdit(false)} currentTask={task} />
        </div>
      ) : (
        <div
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
          className="kanban-card"
        >
          <CardContent task={task} sectionName={sectionName} onClick={() => setIsEdit(true)} onModalStateChange={handleModalStateChange} />
        </div>
      )}
    </>

  );
};

export default CardWrapper;