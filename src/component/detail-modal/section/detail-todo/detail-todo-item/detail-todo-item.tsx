import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DetailTodoHandler from "./detail-todo-handler";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { CombinedTodoItem } from "../detail-todo-list";
import { useEffect, useRef, useState } from "react";
import { formatDateToKoreanDeadline } from "../../../../../utils/date-function";

const DetailTodoItem: React.FC<{
  item: CombinedTodoItem;
  onDelete: (todoId: string) => void;
  onCompleteChange: (todoId: string) => void;
  isOwnerOrParticipant: boolean;
  onUpdateTodoTxt: (todoId: string, newTodoTxt: string) => void;
}> = ({ item, onDelete, onCompleteChange, isOwnerOrParticipant, onUpdateTodoTxt }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>(item.todoTxt);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [item.todoTxt]);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.todoId, disabled: !isOwnerOrParticipant });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const checkboxId = `todo-check-${item.todoId}`;

  const handleClickToEdit = () => {
    if (isOwnerOrParticipant) setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedText(e.target.value);
  };

  const handleSaveEdit = () => {
    if (editedText.trim() !== "" && editedText !== item.todoTxt) {
      onUpdateTodoTxt(item.todoId, editedText.trim());
    } else {
      setEditedText(item.todoTxt);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedText(item.todoTxt);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <li className="task-detail__detail-modal-todo-item" style={{ ...style }} ref={setNodeRef} {...attributes}>
      <DetailTodoHandler listeners={listeners} isDragging={isDragging} />
      <div className="task-detail__detail-modal-todo-item-checkbox">
        <div className="task-detail__checkbox-area">
          <input
            type="checkbox"
            className="task-detail__checkbox--native"
            id={checkboxId}
            checked={item.isCompleted}
            onChange={() => onCompleteChange(item.todoId)}
          />
          <label htmlFor={checkboxId} className="task-detail__checkbox--visual" />
        </div>
      </div>
      <div className="task-detail__detail-modal-todo-item-content" style={{ cursor: isOwnerOrParticipant ? 'pointer' : 'default', }}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editedText}
            onChange={handleChange}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            placeholder="할 일을 입력하세요 (Enter: 저장, Esc: 취소)"
            className="task-detail__todo-item__input--exist"
          />
        ) : (
          <div className={`${item.isCompleted ? 'line-through' : ''}`}>
            <span onClick={handleClickToEdit} style={{ width: 'fit-content' }}>{item.todoTxt}</span>
          </div>
        )}
        {item.todoDt ? (<div>{formatDateToKoreanDeadline(item.todoDt)}</div>) : (<div>기한 없음</div>)}
      </div>
      {isOwnerOrParticipant && (
        <div className="todo-item__action todo-item__action--delete" onClick={() => onDelete(item.todoId)}>
          <FontAwesomeIcon icon={faTimes} style={{ width: 12, height: 12, color: "rgba(125, 137, 152, 1)" }} />
        </div>
      )}
    </li>
  );
};

export default DetailTodoItem;