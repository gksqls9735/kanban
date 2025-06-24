import useDropdown from "../../../hooks/use-dropdown";
import DateTimePicker from "../date-picker/datetime-picker";
import { formatDateToYyyyMmDd } from "../../../utils/date-function";
import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../../../styles/datetimepicker.css"

const DROPDOWN_HEIGHT = 438;
const DROPDOWN_WIDTH = 296;
const SCREEN_EDGE_PADDING = 10;

const DatePickerTrigger: React.FC<{
  startDate: Date | null;
  endDate: Date | null;
  onDateSelect: (start: Date | null, end: Date | null) => void;
  minStart?: Date | null;
  onToggle?: (isOpen: boolean) => void;
}> = ({ startDate, endDate, onDateSelect, minStart, onToggle }) => {
  const { isOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  const handleDateUnmount = (start: Date | null, end: Date | null) => {
    onDateSelect(start, end);
  };

  useEffect(() => {
    if (onToggle) {
      onToggle(isOpen);
    }
  }, [isOpen, onToggle]);

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

      if (spaceRight >= currentDropdownWidth) {
        newLeft = rect.right + window.scrollX + SCREEN_EDGE_PADDING;
      } else {
        newLeft = rect.left + window.scrollX - currentDropdownWidth - SCREEN_EDGE_PADDING;
        if (newLeft < window.scrollX + SCREEN_EDGE_PADDING) newLeft = window.scrollX + SCREEN_EDGE_PADDING;
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

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  }, [toggle]);

  const renderDropdownPanel = () => {
    if (!isOpen || !dropdownPosition) return null;

    return ReactDOM.createPortal(
      <div ref={dropdownRef} className="datepicker-dropdown-panel" style={{ top: dropdownPosition.top, left: dropdownPosition.left }}>
        <DateTimePicker
          initialStartDate={startDate}
          initialEndDate={endDate}
          initialShowDeadline={!!endDate}
          initialIncludeTime={startDate ? startDate.getHours() !== 0 || startDate.getMinutes() !== 0 : false}
          onUnmount={handleDateUnmount}
          minStart={minStart}
        />
      </div>
      , document.body
    );
  };

  return (
    <div className="card-datepicker-area">
      <div ref={wrapperRef} onClick={handleToggle} className="card-datepicker-trigger">
        <div className="card-datepicker-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#7d8998">
            <path d="M360-300q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
          </svg>
        </div>
        <span className="card-datepicker-text">
          {startDate && `${formatDateToYyyyMmDd(startDate)} `}
          {endDate && `- ${formatDateToYyyyMmDd(endDate)}`}
        </span>
      </div>
      {renderDropdownPanel()}
    </div>
  );
};

export default DatePickerTrigger;