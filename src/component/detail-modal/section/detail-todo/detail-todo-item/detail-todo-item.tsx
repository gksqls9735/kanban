import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Todo } from "../../../../../types/type";
import { formatDateToKoreanDeadline } from "../../../../../utils/date-function";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DetailTodoHandler from "./detail-todo-handler";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';

const DetailTodoItem: React.FC<{
  todo: Todo
  onDelete: (todoId: string) => void;
  onComplete: (todoId: string) => void;
}> = ({ todo, onDelete, onComplete }) => {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: todo.todoId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };


  const checkboxId = `todo-check-${todo.todoId}`;
  return (
    <li className="task-detail__detail-modal-todo-item" style={{ ...style }} ref={setNodeRef} {...attributes}>
      <DetailTodoHandler listeners={listeners} isDragging={isDragging}/>
      <div className="task-detail__detail-modal-todo-item-checkbox">
        <div className="task-detail__checkbox-area">
          <input
            type="checkbox"
            className="task-detail__checkbox--native"
            id={checkboxId}
            checked={todo.isCompleted}
            onChange={() => onComplete(todo.todoId)}
          />
          <label htmlFor={checkboxId} className="task-detail__checkbox--visual" />
        </div>
      </div>
      <div className="task-detail__detail-modal-todo-item-content">
        <div className={`${todo.isCompleted ? 'line-through' : ''}`}>{todo.todoTxt}</div>
        <div>{formatDateToKoreanDeadline(todo.todoDt)}</div>
      </div>
      <div className="todo-item__action todo-item__action--delete" onClick={() => onDelete(todo.todoId)}>
        <FontAwesomeIcon icon={faTimes} style={{ width: 12, height: 12, color: "rgba(125, 137, 152, 1)" }} />
      </div>
    </li>
  );
};

export default DetailTodoItem;