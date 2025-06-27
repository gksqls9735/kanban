import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isBefore, isSameDay, isSameMonth, isValid, startOfDay, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { useEffect, useRef, useState } from "react";
import DateInput from "./date-input";
import { ko } from "date-fns/locale";

const SingleDatePicker: React.FC<{
  initialDate?: Date | null;
  onUnmount: (selectedDate: Date | null) => void;
  minDate?: Date | null;
}> = ({
  initialDate = null,
  onUnmount,
  minDate
}) => {
    const [currentMonth, setCurrentMonth] = useState<Date>(initialDate ? startOfMonth(initialDate) : new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
    const latestStateRef = useRef<Date | null>(selectedDate);

    useEffect(() => {
      latestStateRef.current = selectedDate;
    }, [selectedDate]);

    useEffect(() => {
      return () => {
        let finalDate = latestStateRef.current;
        if (finalDate) finalDate = startOfDay(finalDate);
        onUnmount(finalDate);
      };
    }, [onUnmount]);

    const handleDateClick = (day: Date) => {
      let newClickedDate = startOfDay(day);
      if (minDate && isValid(minDate) && isSameDay(newClickedDate, minDate) && isBefore(newClickedDate, minDate)) newClickedDate = minDate;
      setSelectedDate(newClickedDate);
    };

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const renderHeader = () => {
      return (
        <div className="calendar-header">
          <button onClick={prevMonth} className="nav-button">
            <FontAwesomeIcon icon={faChevronLeft} style={{ width: 6.43, height: 10, color: '#9E9FA3' }} />
          </button>
          <span>{format(currentMonth, 'yyyy.MM')}</span>
          <button onClick={nextMonth} className="nav-button">
            <FontAwesomeIcon icon={faChevronRight} style={{ width: 6.43, height: 10, color: '#9E9FA3' }} />
          </button>
        </div>
      )
    };

    const renderDays = () => {
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      return (
        <div className="calendar-days-header">
          {days.map(day => (
            <div key={day} className="day-label">
              {day}
            </div>
          ))}
        </div>
      );
    };

    const renderCells = () => {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);

      const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

      const rows: React.ReactElement[] = [];
      let cells: React.ReactElement[] = [];

      daysInCalendar.forEach((day, i) => {
        const isCurrentMonthDay = isSameMonth(day, monthStart);
        const dayIsSelectedDate = selectedDate && isSameDay(day, selectedDate);
        const isDisabledByMindate = minDate && isValid(minDate) && isBefore(startOfDay(day), startOfDay(minDate));

        let cellClass = 'calendar-cell';
        if (!isCurrentMonthDay || isDisabledByMindate) cellClass += ' disabled';
        if (dayIsSelectedDate) cellClass += ' selected-date single-date';

        cells.push(
          <div key={day.toString()} className={cellClass} onClick={() => !isDisabledByMindate && handleDateClick(day)}>
            <span>{format(day, 'd')}</span>
          </div>
        );

        if ((i + 1) % 7 === 0) {
          rows.push(
            <div className="calendar-row" key={`row-${day.toString()}`}>{cells}</div>
          );
          cells = [];
        }
      });
      return <div className="calendar-body">{rows}</div>;
    };

    return (
      <>
        <div className="datetime-picker-container">
          {/** 상단 날짜/시간 표시 및 선택 - 시간 관련 UI 제거 */}
          <div className="selected-info">
            <div className="date-time-row">
              <DateInput
                date={selectedDate}
                setDate={setSelectedDate}
                label="날짜 선택"
                locale={ko}
              />
              {/* 시간 선택 UI 제거 */}
            </div>
          </div>

          {/** 달력 */}
          <div className="calendar-container">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </div>
        </div>
      </>
    );
  };

export default SingleDatePicker;