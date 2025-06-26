import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { CombinedTodoItem } from "../detail-todo-list";
import { normalizeSpaces } from "../../../../../utils/text-function";

const DetailTodoAdd: React.FC<{
  item: CombinedTodoItem;
  onSave: (todoId: string, todoTxt: string, isCompleted: boolean) => void;
  onCancel: (todoId: string) => void;
}> = ({ item, onSave, onCancel }) => {
  const [todoTxt, setTodoTxt] = useState<string>(normalizeSpaces(item.todoTxt));
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    textInputRef.current?.focus();
  }, []);

  const handleSave = () => {
    const processedTodoTxt = normalizeSpaces(todoTxt);
    if (processedTodoTxt === "") {
      onCancel(item.todoId);
      return;
    }
    onSave(item.todoId, todoTxt, isComplete);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel(item.todoId);
    }
  };

  return (
    <li className="task-detail__detail-modal-todo-item task-detail__detail-modal-todo-item--new">
      <div className="task-detail__detail-modal-todo-item-checkbox">
        <div className="task-detail__checkbox-area">
          <input
            type="checkbox"
            className="task-detail__checkbox--native"
            checked={isComplete}
            id={`new-todo-checkbox-${item.todoId}`}
            onChange={() => setIsComplete(!isComplete)}
          />
          <label htmlFor={`new-todo-checkbox-${item.todoId}`} className="task-detail__checkbox--visual" />
        </div>
      </div>
      <div className="task-detail__detail-modal-todo-item-content">
        <input
          ref={textInputRef}
          type="text"
          placeholder="할 일을 입력하세요 (Enter: 저장, Esc: 취소)"
          className="task-detail__todo-item__input"
          value={todoTxt}
          onChange={e => setTodoTxt(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="todo-item__action todo-item__action--delete" onClick={() => onCancel(item.todoId)}>
        <FontAwesomeIcon icon={faTimes} style={{ width: 12, height: 12, color: "rgba(125, 137, 152, 1)" }} />
      </div>
    </li>
  );
};

export default DetailTodoAdd;