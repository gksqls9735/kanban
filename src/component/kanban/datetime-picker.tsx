import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  addMonths,
  eachDayOfInterval, endOfMonth, endOfWeek, format, getHours, getMinutes, isAfter,
  isBefore, isSameDay, isSameMonth, setHours, setMinutes, startOfDay, startOfMonth, startOfWeek,
  subMonths
} from "date-fns";
import { ko } from "date-fns/locale";
import { useEffect, useState } from "react";
import DateInput from "./date-input";

interface DateTimePickerProps {
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
  initialIncludeTime?: boolean;
  initialShowDeadline?: boolean;
  onChange?: (stateDate: Date | null, endDate: Date | null) => void;
}


const DateTimePicker: React.FC<DateTimePickerProps> = ({
  initialStartDate = null,
  initialEndDate = null,
  initialIncludeTime = false,
  initialShowDeadline = false,
  onChange,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(initialStartDate ? startOfMonth(initialStartDate) : new Date());
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialShowDeadline ? initialEndDate : null); // 마감일 표시 여부에 따라 초기화
  const [showDeadline, setShowDeadline] = useState<boolean>(initialShowDeadline);
  const [includeTime, setIncludeTime] = useState<boolean>(initialIncludeTime);

  useEffect(() => {
    onChange?.(startDate, showDeadline ? endDate : null);
  }, [startDate, endDate, showDeadline, onChange]);

  const handleTimeChange = (
    type: 'start' | 'end',
    part: 'hour' | 'minute',
    value: string
  ) => {
    const targetDate = type === 'start' ? startDate : endDate;
    if (!targetDate) return;

    const numericValue = parseInt(value, 10);
    let newDate = targetDate;

    if (part === 'hour') {
      newDate = setHours(targetDate, numericValue);
    } else if (part === 'minute') {
      newDate = setMinutes(targetDate, numericValue);
    }

    if (type === 'start') {
      // 시작 시간이 종료 시간보다 늦을 수 없음
      if (endDate && isAfter(newDate, endDate)) {
        console.warn("시작 시간은 종료 시간보다 늦을 수 없습니다.");
        setEndDate(newDate);  // 종료 시간을 시작 시간에 맞춤
      } else {
        setStartDate(newDate);
      }
    } else {
      // 종료 시간이이 시작 시간보다 빠를 수 없음
      if (startDate && isBefore(newDate, startDate)) {
        console.warn("종료 시간은 시작 시간보다 빠를 수 없습니다.");
        setStartDate(newDate);  // 시작 시간을 종료 시간에 맞춤
      } else {
        setEndDate(newDate);
      }
    }
  };

  // 달력 생성 
  // 달 토글
  const renderHeader = () => {
    return (
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-button">
          <FontAwesomeIcon icon={faChevronLeft} style={{ width: 16, height: 16, color: '#9E9FA3' }} />
        </button>
        <span>{format(currentMonth, 'yyyy.MM')}</span>
        <button onClick={nextMonth} className="nav-button">
          <FontAwesomeIcon icon={faChevronRight} style={{ width: 16, height: 16, color: '#9E9FA3' }} />
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
      const isStartDate = startDate && isSameDay(day, startDate);
      const isEndDate = showDeadline && endDate && isSameDay(day, endDate);
      const isInRange =
        showDeadline && startDate && endDate && isAfter(day, startOfDay(startDate)) && isBefore(day, startOfDay(endDate));

      let cellClass = 'calendar-cell';
      if (!isCurrentMonthDay) cellClass += ' disabled';
      if (isStartDate) cellClass += ' start-date';
      if (isEndDate) cellClass += ' end-date';
      if (isInRange) cellClass += ' in-range';
      if (isStartDate && isEndDate) cellClass += ' single-date';

      cells.push(
        <div
          key={day.toString()}
          className={cellClass}
          onClick={() => handleDateClick(day)}
        >
          <span>{format(day, 'd')}</span>
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div className="calendar-row" key={`row-${day.toString()}`}>
            {cells}
          </div>
        );
        cells = [];
      }
    });
    return <div className="calendar-body">{rows}</div>;
  };

  // 날짜 클릭
  const handleDateClick = (day: Date) => {
    const clickedDateWithTime = includeTime
      ? setMinutes(setHours(day, startDate ? getHours(startDate) : 0), startDate ? getMinutes(startDate) : 0)
      : startOfDay(day);

    if (!showDeadline) {
      // 마감일 미사용
      setStartDate(clickedDateWithTime);
      setEndDate(null);
    } else {
      // 마감일 사용 시: 범위 설정 로직
      if (!startDate || (startDate && endDate)) {
        // 시작일이 없거나 시작일과 종료일 모두 있으면 새로 시작일 설정
        setStartDate(clickedDateWithTime);
        setEndDate(null);
      } else {
        // 시작일만 있고 종료일이 없는 경우
        const startDateWithoutTime = startOfDay(startDate);
        const clickedDayWithoutTime = startOfDay(day);

        if (isBefore(clickedDayWithoutTime, startDateWithoutTime)) {
          // 클릭한 날짜가 시작일보다 이전일 시 시작일 변경
          setStartDate(clickedDateWithTime);
        } else {
          // 클릭한 날짜가 시작일 이후 이거나 같으면 종료일로 설정
          const endDateWithTime = includeTime
            ? setMinutes(setHours(day, endDate ? getHours(endDate) : 0), endDate ? getMinutes(endDate) : 0)
            : startOfDay(day);
          setEndDate(endDateWithTime);
        }
      }
    }
  };

  // 월 이동
  // 이전 달 이동
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // 다음 달 이동
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // 토글 핸들러
  // 마감일
  const handleDeadlineToggle = () => {
    const newState = !showDeadline;
    setShowDeadline(newState);
    if (!newState) {
      setEndDate(null);
    } else {
      // 마감일 활성화 시, 시작일이 있으면 종료일 선택 가능하게 준비
      // (특별한 로직 추가 가능. 예: 시작일 다음 날을 기본 종료일로)
    }
  };

  // 시간 포함 토글 핸들러
  const handleTimeToggle = () => {
    const newState = !includeTime;
    setIncludeTime(newState);
    //  기존 날짜의 시간을 자정으로 리셋 여부
    // if (!newState) {
    //   if (startDate) setStartDate(startOfDay(startDate));
    //   if (endDate) setEndDate(startOfDay(endDate));
    // }
  };

  const renderTimeSelect = (type: 'start' | 'end') => {
    if (!includeTime) return null;
    const targetDate = type === 'start' ? startDate : endDate;
    if (!targetDate || (type === 'end' && !showDeadline)) return null;

    const currentHour = getHours(targetDate);
    const currentMinute = getMinutes(targetDate);

    return (
      <div className="time-select-container">
        <select
          value={currentHour.toString().padStart(2, '0')}
          onChange={e => { handleTimeChange(type, 'hour', e.target.value) }}
          className="time-select"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={`h-${i}`} value={i}>{i.toString().padStart(2, '0')}시</option>
          ))}
        </select>
        <select
          value={currentMinute === 0 ? '00' : currentMinute.toString()}
          onChange={e => handleTimeChange(type, 'minute', e.target.value)}
          className="time-select"
        >
          {Array.from({ length: 6 }, (_, i) => i * 10).map(min => (
            <option key={`m-${min}`} value={min}>{min.toString().padStart(2, '0')}</option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <>
      <div className="datetime-picker-container">
        {/** 상단 날짜/시간 표시 및 선택 */}
        <div className="selected-info">
          {!includeTime && (
            <div className={`date-time-row ${showDeadline ? 'separate' : ''}`}>
              <DateInput
                date={startDate}
                setDate={setStartDate}
                label="시작일"
                locale={ko}
              />
              {showDeadline && (
                <DateInput
                  date={endDate}
                  setDate={setEndDate}
                  label="마감일"
                  locale={ko}
                />
              )}
            </div>
          )}

          {includeTime && (
            showDeadline ? (
              <>
                <div className="date-time-row separate">
                  <DateInput
                    date={startDate}
                    setDate={setStartDate}
                    label="시작일"
                    locale={ko}
                  />
                  {startDate
                    ? renderTimeSelect('start')
                    : <div className="time-placeholder">시작 시간</div>
                  }
                </div>
                <div className="date-time-row separate">
                  <DateInput
                    date={endDate}
                    setDate={setEndDate}
                    label="마감일"
                    locale={ko}
                  />
                  {endDate
                    ? renderTimeSelect('end')
                    : <div className="time-placeholder">마감 시간</div>
                  }
                </div>
              </>
            ) : (
              // Case: includeTime=true, showDeadline=false (Only start date/time)
              <div className="date-time-row separate"> {/* Assuming 'separate' is still desired */}
                <DateInput
                  date={startDate}
                  setDate={setStartDate}
                  label="시작일"
                  locale={ko}
                />
                {startDate
                  ? renderTimeSelect('start')
                  : <div className="time-placeholder">시작 시간</div>
                }
              </div>
            )
          )}
        </div>

        {/** 달력 */}
        <div className="calendar-container">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>

        {/** 하단 토글 */}
        <div className="toggle-section">
          <div className="toggle-item">
            <label htmlFor="deadline-toggle">마감일</label>
            <label className="switch">
              <input
                id="deadline-toggle"
                type="checkbox"
                checked={showDeadline}
                onChange={handleDeadlineToggle}
              />
              <span className="slider round green"></span>
            </label>
          </div>
          <div className="toggle-item">
            <label htmlFor="time-toggle">시간 포함</label>
            <label className="switch">
              <input
                id="time-toggle"
                type="checkbox"
                checked={includeTime}
                onChange={handleTimeToggle}
              />
              <span className="slider round green"></span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default DateTimePicker;