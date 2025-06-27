import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

const DetailTodoHandler: React.FC<{
  listeners: SyntheticListenerMap | undefined;
  isDragging: boolean;
  isOwnerOrParticipant: boolean;
}> = ({ listeners, isDragging, isOwnerOrParticipant }) => {
  let cursorStyle = 'default';
  let opacity = 0.5;

  if (listeners) {
    cursorStyle = isDragging ? 'grabbing' : 'grab';
    opacity = 1;
  }
  return (
    <div
      {...(listeners || {})}
      className="task-detail__todo-item__action"
      style={{ cursor: cursorStyle, opacity: opacity, color: 'rgba(217, 217, 217, 1)' }} // 커서와 투명도 적용
    >
      {isOwnerOrParticipant ? '⠿' : ''}
    </div>
  );
};

export default DetailTodoHandler;