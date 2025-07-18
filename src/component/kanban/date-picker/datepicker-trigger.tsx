import useDropdown from "../../../hooks/use-dropdown";
import DateTimePicker from "./datetime-picker";
import { formatDateToYyMmDd } from "../../../utils/date-function";
import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { DATE_PICKER_STYLE } from "../../../constant/style-constant";

import CalendarIcon from "../../../assets/tabler-icon-calendar-event.svg?react";

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
    if (onToggle) onToggle(isOpen);
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
      <>
        <style>{DATE_PICKER_STYLE}</style>
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
      </>
      , document.body
    );
  };

  return (
    <div className="card-datepicker-area">
      <div ref={wrapperRef} onClick={handleToggle} className="card-datepicker-trigger">
        <div className="card-datepicker-icon-wrapper">
          <CalendarIcon width="16" height="16" />
        </div>
        <span className="card-datepicker-text">
          {startDate && `${formatDateToYyMmDd(startDate)} `}
          {endDate && `- ${formatDateToYyMmDd(endDate)}`}
        </span>
      </div>
      {renderDropdownPanel()}
    </div>
  );
};

export default DatePickerTrigger;