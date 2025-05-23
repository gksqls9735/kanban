import { useEffect, useRef } from "react";
import { Todo } from "../../../types/type";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';

const EditableTodoItem: React.FC<{
  todo: Todo;
  onChange: (todoId: string, updatedTodo: Partial<Pick<Todo, 'todoTxt' | 'isCompleted'>>) => void;
  onDelete: (todoId: string) => void;
  autoFocus?: boolean;
}> = ({ todo, onChange, onDelete, autoFocus = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(todo.todoId, { todoTxt: e.target.value });
  };

  const handleCompletionToggle = () => {
    onChange(todo.todoId, { isCompleted: !todo.isCompleted });
  };

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
      className="todo-item editable-todo-item"
      ref={setNodeRef}
      style={{...style}}
      {...attributes}
    >
      <div className="todo-item__main">
        <div className="todo-item__checkbox-area">
          <input
            type="checkbox"
            checked={todo.isCompleted}
            className="todo-item__checkbox--native"
            id={`new-todo-${todo.todoId}`}
            onChange={() => { }}
          />
          <label onClick={handleCompletionToggle} htmlFor={`new-todo-${todo.todoId}`} className="todo-item__checkbox--visual"/>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={todo.todoTxt}
          onChange={handleTextChange}
          placeholder="할 일을 입력하세요."
          className="todo-item__input"
        />
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

export default EditableTodoItem;