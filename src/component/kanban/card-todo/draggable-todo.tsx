import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { Todo } from "../../../types/type";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const DraggableTodo: React.FC<{
  todo: Todo;
  onCompleteChange: (todoId: string) => void;
  onDelete: (todoId: string) => void;
}> = ({ todo, onCompleteChange, onDelete }) => {
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


  return (
    <div
      className="todo-item"
      ref={setNodeRef}
      style={{ ...style }}
      {...attributes}
    >
      <div className="todo-item__main">
        <div className="todo-item__checkbox-area">
          <input
            type="checkbox"
            checked={todo.isCompleted}
            className="todo-item__checkbox--native"
            id={`todo-${todo.todoId}`}
            onChange={() => { }}
          />
          <label onClick={() => onCompleteChange(todo.todoId)} htmlFor={`todo-${todo.todoId}`} className="todo-item__checkbox--visual"></label>
        </div>
        <div className={`todo-item__text truncate ${todo.isCompleted ? 'line-through' : ''}`} onClick={() => onCompleteChange(todo.todoId)}>
          {todo.todoTxt}
        </div>
      </div>
      <div className="todo-item__actions">
        <div className="todo-item__action todo-item__action--delete" onClick={() => onDelete(todo.todoId)}>
          <FontAwesomeIcon icon={faTimes} style={{ width: 12, height: 12, color: "rgba(125, 137, 152, 1)" }} />
        </div>
        <div
          className="todo-item__action todo-item__action--drag-handle"
          {...listeners}
        >
          ⠿
        </div>
      </div>
    </div>
  );
};

export default DraggableTodo;