import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";

const DetailTodoAdd: React.FC<{
  handleIsAddTask: () => void;
  onAdd: (todoTxt: string, isComplete: boolean) => void;
}> = ({ handleIsAddTask, onAdd }) => {

  const newTaskTextRef = useRef<HTMLInputElement>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const handleAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!newTaskTextRef.current) return;
    const todoTxt = newTaskTextRef.current.value;
    if (!todoTxt) return;
    if (e.key === 'Enter') {
      onAdd(todoTxt, isComplete);
      newTaskTextRef.current.value = '';
      setIsComplete(false);
    }
  };

  useEffect(() => {
    newTaskTextRef.current?.focus();
  }, []);

  return (
    <li className="task-detail__detail-modal-todo-item">
      <div className="task-detail__todo-item__action task-detail__todo-item__action--drag-handle">⠿</div>
      <div className="task-detail__detail-modal-todo-item-checkbox">
        <div className="task-detail__checkbox-area">
          <input
            ref={newTaskTextRef}
            type="checkbox"
            className="task-detail__checkbox--native"
            checked={isComplete}
            id={`newTask`}
            onChange={() => setIsComplete(!isComplete)}
          />
          <label htmlFor={`newTask`} className="task-detail__checkbox--visual" />
        </div>
      </div>
      <div className="task-detail__detail-modal-todo-item-content">
        <input
          ref={newTaskTextRef}
          onKeyDown={handleAdd}
          type="text"
          placeholder="할 일을 입력하세요."
          className="task-detail__todo-item__input"
        />
      </div>
      <div className="todo-item__action todo-item__action--delete" onClick={handleIsAddTask}>
        <FontAwesomeIcon icon={faTimes} style={{ width: 12, height: 12, color: "rgba(125, 137, 152, 1)" }} />
      </div>
    </li>
  );
};

export default DetailTodoAdd;