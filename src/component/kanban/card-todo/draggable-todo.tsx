import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { Todo } from "../../../types/type";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef } from "react";

const DraggableTodo: React.FC<{
  todo: Todo;
  isOwnerOrParticipant: boolean;
  onCompleteChange: (todoId: string) => void;
  onDelete: (todoId: string) => void;
  isEditing: boolean;
  onStartEdit: (todoId: string) => void;
  onTextChange: (todoId: string, text: string) => void;
  onEndEdit: () => void;
}> = ({ todo, isOwnerOrParticipant, onCompleteChange, onDelete, isEditing, onStartEdit, onTextChange, onEndEdit }) => {
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

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') onEndEdit();
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

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={todo.todoTxt}
            onChange={e => onTextChange(todo.todoId, e.target.value)}
            onBlur={onEndEdit}
            onKeyDown={handleKeyDown}
            placeholder="할 일을 입력하세요."
            className="todo-item__input"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <div className={`todo-item__text ${todo.isCompleted ? 'line-through' : ''} truncate`} onClick={() => onStartEdit(todo.todoId)}>
            {todo.todoTxt}
          </div>
        )}
      </div>
      {isOwnerOrParticipant && (
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
      )}
    </div>
  );
};

export default DraggableTodo;