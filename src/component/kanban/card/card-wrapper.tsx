import { CSS } from '@dnd-kit/utilities';
import { useSortable } from "@dnd-kit/sortable";
import React, { useState } from "react";
import CardContent from "./card-content";
import { Task } from '../../../types/type';
import UpdateCard from './update-card';
import { useKanbanActions } from '../../../context/task-action-context';
import useUserStore from '../../../store/user-store';

const CardWrapper: React.FC<{
  task: Task;
  sectionName: string;
  isOverlay?: boolean;
  onOpenDetailModal?: (taskId: string) => void;
}> = ({ task, sectionName, isOverlay, onOpenDetailModal }) => {
  const { onSelectTaskId } = useKanbanActions();
  const currentUser = useUserStore(state => state.currentUser);

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState<boolean>(false);

  const isOwnerOrParticipant =
    task.taskOwner.id === currentUser?.id ||
    task.participants.some(p => p.id === currentUser?.id);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.taskId,
    data: {
      task: task, type: 'Task',
    },
    disabled: isAnyModalOpen || !isOwnerOrParticipant,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    marginBottom: '8px',
    position: 'relative',
    backgroundColor: 'white',
    cursor: isAnyModalOpen || !isOwnerOrParticipant ? 'pointer' : (isOverlay ? 'grabbing' : 'grab'),
  };

  const handleModalStateChange = (isOpen: boolean) => {
    setIsAnyModalOpen(isOpen);
  };

  const handleOpenDetailModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenDetailModal) {
      onOpenDetailModal(task.taskId);
    }
    if (onSelectTaskId) {
      onSelectTaskId(task.taskId);
    }
  };

  const handleEditMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEdit(true);
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
          className={`kanban-card ${isOwnerOrParticipant ? 'is-draggable' : ''}`}
          onClick={handleOpenDetailModal}
        >
          <CardContent task={task} sectionName={sectionName} onClick={handleEditMode} onModalStateChange={handleModalStateChange} isOwnerOrParticipant={isOwnerOrParticipant} />
        </div>
      )}
    </>

  );
};

export default CardWrapper;