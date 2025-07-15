import { useCallback, useEffect, useState } from "react";
import useDropdown from "../../../../hooks/use-dropdown";
import { Task } from "../../../../types/type";
import { formatToKoreanDateTimeString } from "../../../../utils/date-function";
import { createPortal } from "react-dom";
import { DATE_PICKER_STYLE } from "../../../../constant/style-constant";
import DetailDateTimePicker from "../../../kanban/date-picker/detail/detail-datetime-picker";

const DROPDOWN_HEIGHT = 438;
const DROPDOWN_WIDTH = 296;
const SCREEN_EDGE_PADDING = 10;

const DateField: React.FC<{
  task: Task;
  dateType: 'start' | 'end';
  isOwnerOrParticipant: boolean;
  onDateChange: (updates: Partial<Task>) => void;
  minStart?: Date | null;
}> = ({ task, dateType, isOwnerOrParticipant, onDateChange, minStart }) => {
  const label = dateType === 'start' ? '시작일' : '마감일';
  const displayDate =
    dateType === 'start' ? formatToKoreanDateTimeString(task.start)
      : (dateType === 'end' && task.end) ? formatToKoreanDateTimeString(task.end) : '종료일 미정';

  const { isOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [isReadyToRenderDropdown, setIsReadyToRenderDropdown] = useState<boolean>(false);

  const [pendingUpdate, setPendingUpdate] = useState<{ start: Date | null, end: Date | null } | null>(null);
  const [initialDatesOnOpen, setInitialDatesOnOpen] = useState<{ start: Date | null, end: Date | null } | null>(null);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    if (!isOwnerOrParticipant) return;
    e.stopPropagation();
    toggle();
  }, [isOwnerOrParticipant, toggle]);

  useEffect(() => {
    if (isOpen) {
      const initialState = { start: task.start ? new Date(task.start) : null, end: task.end ? new Date(task.end) : null };
      setPendingUpdate(initialState);
      setInitialDatesOnOpen(initialState);
    } else {
      if (pendingUpdate && initialDatesOnOpen) {
        const startChanged = pendingUpdate.start?.getTime() !== initialDatesOnOpen.start?.getTime();
        const endChanged = (pendingUpdate.end?.getTime() ?? null) !== (initialDatesOnOpen.end?.getTime() ?? null);        // 확인 필요
        if (startChanged || endChanged) onDateChange({ start: pendingUpdate.start ?? undefined, end: pendingUpdate.end ?? undefined });
      }
      setPendingUpdate(null);
      setInitialDatesOnOpen(null);
    }
  }, [isOpen]);


  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = 0;
      let left = 0;

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow >= DROPDOWN_HEIGHT + SCREEN_EDGE_PADDING) {
        // 아래 공간 확인 공간이 충분하면 아래로 열기
        top = rect.bottom + window.scrollY + 2;
      } else if (spaceAbove >= DROPDOWN_HEIGHT + SCREEN_EDGE_PADDING) {
        // 아래 공간 부족 위로 열기
        top = rect.top + window.scrollY - DROPDOWN_HEIGHT - 2;
      } else {
        // 위아래 모두 부족
        top = Math.max(SCREEN_EDGE_PADDING, rect.top + window.scrollY - DROPDOWN_HEIGHT - 2)
        if (top + DROPDOWN_HEIGHT > viewportHeight + window.scrollY) {
          top = viewportHeight + window.scrollY - DROPDOWN_HEIGHT - SCREEN_EDGE_PADDING;
        }
      }

      left = rect.left + window.scrollX;
      // 화면 오른쪽 경계
      if (left + DROPDOWN_WIDTH > viewportWidth + window.scrollX - SCREEN_EDGE_PADDING) {
        left = viewportWidth + window.scrollX - DROPDOWN_WIDTH - SCREEN_EDGE_PADDING;
      }
      // 화면 왼쪽 경계
      if (left < window.scrollX + SCREEN_EDGE_PADDING) {
        left = window.scrollX + SCREEN_EDGE_PADDING;
      }

      setDropdownPosition({ top, left });
      setIsReadyToRenderDropdown(true);
    } else {
      setIsReadyToRenderDropdown(false);
    }
  }, [isOpen, wrapperRef]);

  const handleDateTimePickerChange = useCallback((newStart: Date | undefined, newEnd: Date | undefined) => {
    setPendingUpdate({ start: newStart ?? null, end: newEnd ?? null });
  }, []);

  const renderDropdown = () => {
    if (!isOpen || !isReadyToRenderDropdown || !dropdownPosition) return null;
    const startTimeExists = task.start && (new Date(task.start).getHours() !== 0 || new Date(task.start).getMinutes() !== 0);
    const endTimeExists = task.end && (new Date(task.end).getHours() !== 0 || new Date(task.end).getMinutes() !== 0);
    const initialIncludeTime = !!(startTimeExists || endTimeExists);
    const initialShowDeadline = dateType === 'end' || !!task.end;
    return createPortal(
      <>
        <style>{DATE_PICKER_STYLE}</style>
        <div
          ref={dropdownRef}
          className="datepicker-dropdown-panel"
          style={{ position: 'absolute', top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
        >
          <DetailDateTimePicker
            initialStartDate={pendingUpdate?.start ?? null}
            initialEndDate={pendingUpdate?.end ?? null}
            initialIncludeTime={initialIncludeTime}
            initialShowDeadline={initialShowDeadline}
            onChange={handleDateTimePickerChange}
            minStart={minStart}
            dateType={dateType}
          />
        </div>
      </>, document.body
    )
  };

  const valueClassName = [
    "task-detail__detail-modal-info-value--date",
    !isOwnerOrParticipant ? "task-detail__detail-modal-info-value--date--locked" : ""
  ].filter(Boolean).join(" ");

  return (
    <div className="task-detail__detail-modal-info-row task-detail__detail-modal-info-row--date">
      <div className="task-detail__detail-modal-info-label">{label}</div>
      <div className={valueClassName} onClick={handleToggle} ref={wrapperRef}>
        <div className="task-detail__detail-modal-info-icon">
          <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#7d8998">
            <path d="M360-300q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
          </svg>
        </div>
        <div className="task-detail__detail-modal-info-date">{displayDate}</div>
      </div>
      {renderDropdown()}
    </div>
  );
};

export default DateField;