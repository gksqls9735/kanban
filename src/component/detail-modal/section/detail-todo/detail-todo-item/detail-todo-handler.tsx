import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

const DetailTodoHandler: React.FC<{
  listeners : SyntheticListenerMap | undefined;
  isDragging: boolean
}> = ({ listeners, isDragging }) => {
  return (
    <div {...listeners} className="task-detail__todo-item__action task-detail__todo-item__action--drag-handle"
      style={{cursor: `${isDragging ? 'grabbing' : 'grab'}`}}
    >⠿</div>
  );
};

export default DetailTodoHandler;