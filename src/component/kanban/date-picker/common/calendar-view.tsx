import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isAfter, isBefore, isSameDay, isSameMonth, isValid, startOfDay, startOfMonth, startOfWeek } from "date-fns";

interface CalendarViewProps {
  currentMonth: Date;
  startDate: Date | null;
  endDate: Date | null;
  minStart?: Date | null;
  mode?: 'start' | 'end' | 'none';
  onDateClick: (day: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  startDate,
  endDate,
  minStart,
  mode,
  onDateClick,
  onPrevMonth,
  onNextMonth
}) => {
  // 달 토글
  const renderHeader = () => {
    return (
      <div className="calendar-header">
        <button onClick={onPrevMonth} className="nav-button">
          <FontAwesomeIcon icon={faChevronLeft} style={{ width: 6.43, height: 10, color: '#9E9FA3' }} />
        </button>
        <span>{format(currentMonth, 'yyyy.MM')}</span>
        <button onClick={onNextMonth} className="nav-button">
          <FontAwesomeIcon icon={faChevronRight} style={{ width: 6.43, height: 10, color: '#9E9FA3' }} />
        </button>
      </div>
    )
  }

  // 요일 생성
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

  // 일 생성
// ✅ 요청하신 규칙에 맞춘 최종 renderCells 함수

const renderCells = () => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const rows: React.ReactElement[] = [];
  let cells: React.ReactElement[] = [];

  daysInCalendar.forEach((day, i) => {
    const dayIsStartDate = startDate && isSameDay(day, startDate);
    const dayIsEndDate = endDate && isSameDay(day, endDate);
    const hasBothDatesAndDifferent = startDate && endDate && !isSameDay(startDate, endDate);
    const isInRange =
      startDate && endDate &&
      isAfter(day, startOfDay(startDate)) &&
      isBefore(day, startOfDay(endDate));

    // ✅ "진짜 클릭이 불가능한가?"를 판단하는 유일한 조건
    const isUnclickable = 
      (minStart && isValid(minStart) && isBefore(day, startOfDay(minStart))) || 
      (mode === 'end' && startDate && isBefore(day, startOfDay(startDate)));

    // ✅ 현재 달의 날짜인지 확인
    const isCurrentMonthDay = isSameMonth(day, monthStart);

    // ✅ 클래스 부여 로직을 새 규칙에 맞게 재구성
    let cellClass = 'calendar-cell';
    if (isUnclickable) {
      // 진짜 비활성화된 경우
      cellClass += ' disabled';
    }
    if (!isCurrentMonthDay) {
      // 다른 달 날짜인 경우 (isUnclickable과 중복될 수 있음)
      cellClass += ' other-month';
    }
    
    // --- 날짜 범위 관련 클래스 부여는 동일 ---
    if (dayIsStartDate && dayIsEndDate) {
      cellClass += ' start-date end-date single-date';
    } else if (dayIsStartDate && hasBothDatesAndDifferent) {
      cellClass += ' start-date-in-range';
    } else if (dayIsEndDate) {
      cellClass += ' end-date';
    } else if (dayIsStartDate) {
      cellClass += ' start-date';
    } else if (isInRange) {
      cellClass += ' in-range';
    }

    cells.push(
      <div
        key={day.toString()}
        className={cellClass}
        // ✅ 클릭은 isUnclickable이 아닐 때만 가능
        onClick={() => !isUnclickable && onDateClick(day)}
      >
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
    <div className="calendar-container">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default CalendarView;