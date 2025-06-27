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
}> = ({ item, onDelete, onCompleteChange, isOwnerOrParticipant, onUpdateTodoTxt, onUpdateTodoDt }) => {
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
        <style>{dropdownStyle}</style>
        <div ref={dropdownRef} className="datepicker-dropdown-panel" style={{ top: dropdownPosition.top, left: dropdownPosition.left }}>
          <SingleDatePicker
            initialDate={item.todoDt || null}
            onUnmount={handleDateUnmount}
            minDate={null}
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



const dropdownStyle = `
/* DateTimePicker */
.datepicker-dropdown-panel {
  position: absolute;
  z-index: 10;
}

.datetime-picker-container {
  display: inline-flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px 24px;
  background-color: #fff;
  width: 296px;
  box-shadow: 0px 0px 16px 0px #00000014;
  box-sizing: border-box;
}

/* 상단 선택 정보 */
.datetime-picker-container .selected-info {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.datetime-picker-container .date-time-row {
  gap: 8px;
  width: 100%;
}

.datetime-picker-container .date-time-row.separate {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.datetime-picker-container .date-time-row>div:has(.date-input),
.datetime-picker-container .date-time-row>.time-placeholder,
.datetime-picker-container .date-time-row>.time-select-container {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.datetime-picker-container .date-time-row .date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.datetime-picker-container .date-time-row .date-input {
  padding: 8px 12px;
  padding-right: 30px;
  border: 1px solid rgba(228, 232, 238, 1);
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  background-color: white;
  width: 100%;
  height: 36px;
  min-width: 0;
  box-sizing: border-box;
  font-weight: 400;
}

.datetime-picker-container .date-time-row .date-input:focus {
  outline: none;
  border: none;
  border: 1px solid rgba(228, 232, 238, 1);
}

.datetime-picker-container .date-time-row .clear-date-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background-color: #d3d8e0;
  border-radius: 50%;
  z-index: 1;
}

.datetime-picker-container .date-time-row .time-placeholder {
  padding: 8px 12px;
  font-size: 13px;
  color: rgba(141, 153, 168, 1);
  border: 1px solid rgba(228, 232, 238, 1);
  border-radius: 4px;
  width: 100%;
  height: 36px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
  background-color: white;
}

.datetime-picker-container .date-time-row .date-input.select {
  background-color: #fff;
  color: #333;
  border-color: #a0a0a0;
}

.datetime-picker-container .date-time-row .time-select-combined {
  flex-grow: 1;
  padding: 0 8px;
  border: 1px solid rgba(228, 232, 238, 1);
  border-radius: 4px;
  font-size: 13px;
  background-color: #fff;
  height: 36px;
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
  cursor: pointer;
  color: #0F1B2A;
  ;

  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%3E%3Cpolyline%20points%3D%221%2C1%205%2C5%209%2C1%22%20stroke%3D%22%23666666%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 12px top 50%;
  background-size: .5rem auto;
}

.datetime-picker-container .date-time-row .time-select-combined {
  outline: none;
  border: none;
  border: 1px solid rgba(228, 232, 238, 1);
}

/* 달력 헤더 */
.datetime-picker-container .calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 18px;
  color: #36363D;
}

.datetime-picker-container .calendar-header .nav-button {
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #555;
}

.datetime-picker-container .calendar-header .nav-button:hover {
  color: #000;
}

/* 요일 헤더 */
.datetime-picker-container .calendar-days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  color: #777;
  margin-bottom: 8px;
}

.datetime-picker-container .calendar-days-header .day-label {
  font-size: 14px;
  font-weight: 400;
  text-align: center;
}

/* 날짜 셀 그리드 */
.datetime-picker-container .calendar-body {
  display: flex;
  flex-direction: column;
}

.datetime-picker-container .calendar-body .calendar-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.datetime-picker-container .calendar-body .calendar-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  width: 32px;
  text-align: center;
  cursor: pointer;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 400;
  position: relative;
  transition: background-color 0.2s ease, color 0.2s ease;
  margin: 1px;
  box-sizing: border-box;
}

.datetime-picker-container .calendar-body .calendar-cell span {
  position: relative;
  z-index: 2;
}

.datetime-picker-container .calendar-body .calendar-cell:not(.disabled):hover {
  background-color: #eee;
}

.datetime-picker-container .calendar-body .calendar-cell.disabled {
  color: #ccc;
  cursor: default;
}

.datetime-picker-container .calendar-body .calendar-cell.start-date,
.calendar-cell.end-date {
  background-color: #16B364;
  color: white;
  font-weight: 400;
}

.datetime-picker-container .calendar-body .calendar-cell.single-date {
  background-color: #16B364;
  color: white;
}

.datetime-picker-container .calendar-body .calendar-cell.start-date-in-range {
  color: #16B364;
  border: 1px solid #16B364;
  font-weight: 400;
}

/* 선택한 날짜 표시 */
/* 기간 내 */
.datetime-picker-container .calendar-body .calendar-cell.in-range {
  background-color: #D1FADF;
  color: #16B364;
  border-radius: 50%;
}

/* 하단 토글 섹션 */
.datetime-picker-container .toggle-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E4E8EE;
}

.datetime-picker-container .toggle-section .toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.datetime-picker-container .toggle-section .toggle-item label:first-child {
  font-weight: 400;
  font-size: 13px;
  color: #36363D;
}

.datetime-picker-container .toggle-section .switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 24px;
}

.datetime-picker-container .toggle-section .switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.datetime-picker-container .toggle-section .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #E4E8EE;
  -webkit-transition: .4s;
  transition: .4s;
}

.datetime-picker-container .toggle-section .slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  top: 3px;
  left: 3px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
  box-shadow: 0px 0px 4px 0px #00000029;
}

.datetime-picker-container .toggle-section input:checked+.slider {
  border-color: #bdbdbd;
}

.datetime-picker-container .toggle-section input:checked+.slider.green {
  background-color: #16B364;
}

.datetime-picker-container .toggle-section input:checked+.slider:before {
  -webkit-transform: translate(19px);
  -ms-transform: translate(19px);
  transform: translateX(19px);
}

.datetime-picker-container .toggle-section .slider.round {
  border-radius: 12px;
}

.datetime-picker-container .toggle-section .slider.round:before {
  border-radius: 12px;
  box-shadow: 0px 0px 4px 0px #00000029;
}


.datetime-picker-container .custom-time-select-container {
  position: relative;
  width: 100%;
  min-width: 0;
  flex-grow: 1;
  box-sizing: border-box;
}

.datetime-picker-container .custom-select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  border: 1px solid rgba(228, 232, 238, 1);
  border-radius: 4px;
  font-size: 13px;
  background-color: #fff;
  height: 36px;
  cursor: pointer;
  color: #0F1B2A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.datetime-picker-container .custom-select-trigger .custom-select-arrow-icon {
  width: 10px;
  height: 6px;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%3E%3Cpolyline%20points%3D%221%2C1%205%2C5%209%2C1%22%20stroke%3D%22%23666666%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  margin-left: 8px;
}

.datetime-picker-container .custom-select-options {
  position: absolute;
  top: 50%;
  left: 90%;
  width: 152px;
  max-height: 196px;
  overflow-y: auto;
  border-radius: 4px;
  padding: 8px 0px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.datetime-picker-container .custom-select-options ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.datetime-picker-container .custom-select-options li {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #0F1B2A;
}

.datetime-picker-container .custom-select-options li:hover {
  background-color: #f0f0f0;
}

.datetime-picker-container .custom-select-options li.selected {
  background-color: #ECFDF3;
}

.datetime-picker-container .custom-select-options::-webkit-scrollbar {
  width: 5px;
  height: 0px;
}

.datetime-picker-container .custom-select-options::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.datetime-picker-container .custom-select-options::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.datetime-picker-container .custom-select-options::-webkit-scrollbar-track {
  background-color: transparent;
  border-radius: 10px;
}

.datetime-picker-container .custom-select-options::-webkit-scrollbar-button {
  display: none;
}`