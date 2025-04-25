import { format } from "date-fns";
import { ko } from "date-fns/locale";
import DateTimePicker from "../datetime-picker";
import useDropdown from "../../../hooks/use-dropdown";

const formatDateDisplay = (date: Date | null) => {
  if (!date) return '';
  return format(date, 'yyyy.MM.dd', { locale: ko });
};

const DatePickerTrigger: React.FC<{
  startDate: Date | null;
  endDate: Date | null;
  onDateSelect: (start: Date | null, end: Date | null) => void;
}> = ({ startDate, endDate, onDateSelect }) => {
  const { isOpen, wrapperRef, dropdownRef, toggle } = useDropdown();

  const handleDateChange = (start: Date | null, end: Date | null) => {
    onDateSelect(start, end);
  };

  return (
    <div className="card-datepicker-area">
      <div ref={wrapperRef} onClick={toggle} className="card-datepicker-trigger">
        <div className="card-datepicker-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#7d8998">
            <path d="M360-300q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
          </svg>
        </div>
        <span className="card-datepicker-text">
          {startDate && endDate && startDate.getTime() !== endDate.getTime()
            ? `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`
            : formatDateDisplay(startDate)}
        </span>
      </div>
      {isOpen && (
        <div ref={dropdownRef} className="datepicker-dropdown-panel">
          <DateTimePicker
            initialStartDate={startDate}
            initialEndDate={endDate}
            initialShowDeadline={!!endDate}
            initialIncludeTime={startDate ? startDate.getHours() !== 0 || startDate.getMinutes() !== 0 : false}
            onChange={handleDateChange}
          />
        </div>
      )}
    </div>
  );
};

export default DatePickerTrigger;