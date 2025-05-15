import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

const DetailTodoHandler: React.FC<{
  listeners : SyntheticListenerMap | undefined
}> = ({ listeners }) => {
  return (
    <div {...listeners} className="task-detail__todo-item__action task-detail__todo-item__action--drag-handle">⠿</div>
  );
};

export default DetailTodoHandler;