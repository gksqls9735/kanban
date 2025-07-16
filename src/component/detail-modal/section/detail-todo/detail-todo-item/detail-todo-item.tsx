import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DetailTodoHandler from "./detail-todo-handler";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { CombinedTodoItem } from "../detail-todo-list";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatDateToKoreanDeadline } from "../../../../../utils/date-function";
import { normalizeSpaces } from "../../../../../utils/text-function";
import useDropdown from "../../../../../hooks/use-dropdown";
import ReactDOM from "react-dom";
import SingleDatePicker from "../../../../kanban/date-picker/single-datetime-picker";
import { DATE_PICKER_STYLE } from "../../../../../constant/style-constant";

const DROPDOWN_HEIGHT = 370;
const DROPDOWN_WIDTH = 296;
const SCREEN_EDGE_PADDING = 10;

const DetailTodoItem: React.FC<{
  item: CombinedTodoItem;
  onDelete: (todoId: string) => void;
  onCompleteChange: (todoId: string) => void;
  isOwnerOrParticipant: boolean;
  onUpdateTodoTxt: (todoId: string, newTodoTxt: string) => void;
  onUpdateTodoDt: (todoId: string, newTodoDt: Date | null) => void;
  taskStartDate: Date;
  taskEndDate: Date | null;
}> = ({ item, onDelete, onCompleteChange, isOwnerOrParticipant, onUpdateTodoTxt, onUpdateTodoDt, taskStartDate, taskEndDate }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>(normalizeSpaces(item.todoTxt));
  const inputRef = useRef<HTMLInputElement>(null);

  const { isOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    setEditedText(normalizeSpaces(item.todoTxt));
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [item.todoTxt, isEditing]);

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
    const processedText = normalizeSpaces(editedText);

    if (processedText !== "" && processedText !== normalizeSpaces(item.todoTxt)) {
      onUpdateTodoTxt(item.todoId, processedText);
    } else {
      setEditedText(normalizeSpaces(item.todoTxt));
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedText(normalizeSpaces(item.todoTxt));
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

  const handleDateUnmount = useCallback((selectedDate: Date | null) => {
    onUpdateTodoDt(item.todoId, selectedDate);
  }, [item.todoId, onUpdateTodoDt]);

  const calcDropdownPosition = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      let newLeft: number = 0;
      let newTop: number = 0;

      const currentDropdownHeight = dropdownRef.current?.offsetHeight || DROPDOWN_HEIGHT;
      const currentDropdownWidth = dropdownRef.current?.offsetWidth || DROPDOWN_WIDTH;

      newTop = rect.top + window.scrollY;

      if (newTop + currentDropdownHeight + SCREEN_EDGE_PADDING > window.innerHeight + window.scrollY) {
        newTop = window.innerHeight + window.scrollY - currentDropdownHeight - SCREEN_EDGE_PADDING;
        if (newTop < window.scrollY + SCREEN_EDGE_PADDING) newTop = window.scrollY + 5;
      }
      if (newTop < window.scrollY + SCREEN_EDGE_PADDING) newTop = window.scrollY + SCREEN_EDGE_PADDING;

      const spaceRight = window.innerWidth + window.scrollX - rect.right - SCREEN_EDGE_PADDING;
      const spaceLeft = rect.left + window.scrollX - SCREEN_EDGE_PADDING;

      if (spaceRight >= currentDropdownWidth) {
        newLeft = rect.right + window.scrollX + SCREEN_EDGE_PADDING;
      } else if (spaceLeft >= currentDropdownWidth) {
        newLeft = rect.left + window.scrollX - currentDropdownWidth - SCREEN_EDGE_PADDING;
      } else {
        newLeft = window.scrollX + SCREEN_EDGE_PADDING;
      }
      setDropdownPosition({ top: newTop, left: newLeft });
    }
  }, [wrapperRef, dropdownRef]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        calcDropdownPosition();
      }, 0);

      window.addEventListener('resize', calcDropdownPosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', calcDropdownPosition);
      };
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen, calcDropdownPosition]);

  const renderDropdownPanel = () => {
    if (!isOpen || !dropdownPosition) return null;
    return ReactDOM.createPortal(
      <>
        <style>{DATE_PICKER_STYLE}</style>
        <div ref={dropdownRef} className="datepicker-dropdown-panel" style={{ top: dropdownPosition.top, left: dropdownPosition.left }}>
          <SingleDatePicker
            initialDate={item.todoDt || null}
            onUnmount={handleDateUnmount}
            minDate={taskStartDate}
            maxDate={taskEndDate}
          />
        </div>
      </>, document.body
    )
  };

  return (
    <li className="task-detail__detail-modal-todo-item" style={{ ...style }} ref={setNodeRef} {...attributes}>
      <DetailTodoHandler listeners={listeners} isDragging={isDragging} isOwnerOrParticipant={isOwnerOrParticipant} />
      <div className="task-detail__detail-modal-todo-item-checkbox">
        <div className="task-detail__checkbox-area">
          <input
            type="checkbox"
            className="task-detail__checkbox--native"
            id={checkboxId}
            checked={item.isCompleted}
            onChange={() => onCompleteChange(item.todoId)}
          />
          <label htmlFor={checkboxId} className="task-detail__checkbox--visual" style={{ cursor: isOwnerOrParticipant ? 'pointer' : 'default', }}/>
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

        {isOwnerOrParticipant ? (
          <div ref={wrapperRef} onClick={toggle} style={{ cursor: 'pointer', width: 'fit-content' }}>
            {item.todoDt ? (<div>{formatDateToKoreanDeadline(item.todoDt)}</div>) : (<div>기한 없음</div>)}
          </div>
        ) : (
          item.todoDt ? (<div>{formatDateToKoreanDeadline(item.todoDt)}</div>) : (<div>기한 없음</div>)
        )}
        {renderDropdownPanel()}
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
