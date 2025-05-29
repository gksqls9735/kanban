import { faChevronDown, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  addMonths,
  eachDayOfInterval, endOfMonth, endOfWeek, format, getHours, getMinutes, isAfter,
  isBefore, isSameDay, isSameMonth, isValid, setHours, setMinutes, startOfDay, startOfMonth, startOfWeek,
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
  minStart?: Date | null;
}


const DateTimePicker: React.FC<DateTimePickerProps> = ({
  initialStartDate = null,
  initialEndDate = null,
  initialIncludeTime = false,
  initialShowDeadline = false,
  onChange,
  minStart
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(initialStartDate ? startOfMonth(initialStartDate) : new Date());
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialShowDeadline ? initialEndDate : null); // 마감일 표시 여부에 따라 초기화
  const [showDeadline, setShowDeadline] = useState<boolean>(initialShowDeadline);
  const [includeTime, setIncludeTime] = useState<boolean>(initialIncludeTime);

  useEffect(() => {
    onChange?.(startDate, showDeadline ? endDate : null);
  }, [startDate, endDate, showDeadline, onChange]);

  // 달력 생성 
  // 달 토글
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
      const dayIsStartDate = startDate && isSameDay(day, startDate);
      const dayIsEndDate = showDeadline && endDate && isSameDay(day, endDate);
      const hasBothDatesAndDifferent = startDate && endDate && !isSameDay(startDate, endDate);
      const isInRange =
        showDeadline && startDate && endDate &&
        isAfter(day, startOfDay(startDate)) &&
        isBefore(day, startOfDay(endDate));

      const isDisabledByMinStart = minStart && isValid(minStart) && isBefore(startOfDay(day), startOfDay(minStart));


      let cellClass = 'calendar-cell';
      if (!isCurrentMonthDay || isDisabledByMinStart) {
        cellClass += ' disabled';
      }
      if (dayIsStartDate && dayIsEndDate) {
        // 시작일과 종료일이 같은 경우 (하루 선택)
        cellClass += ' start-date end-date single-date';
      } else if (dayIsStartDate && hasBothDatesAndDifferent) {
        // 시작일이고, 종료일도 선택된 상태 (다른 날짜)
        cellClass += ' start-date-in-range';
      } else if (dayIsEndDate) {
        // 종료일인 경우 (시작일과 같거나, 시작일이 없거나, 시작일과 다른 경우 모두 포함)
        cellClass += ' end-date';
      } else if (dayIsStartDate) {
        // 시작일만 선택된 경우 (종료일 없음)
        cellClass += ' start-date';
      } else if (isInRange) {
        // 시작일과 종료일 사이의 날짜인 경우
        cellClass += ' in-range';
      }

      cells.push(
        <div
          key={day.toString()}
          className={cellClass}
          onClick={() => !isDisabledByMinStart && handleDateClick(day)}
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
  };

  const generateTimeOptions = (intervalMinutes = 10) => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        const hourStr = h.toString().padStart(2, '0');
        const minuteStr = m.toString().padStart(2, '0');
        const timeValue = `${hourStr}:${minuteStr}`;
        const ampm = h < 12 ? '오전' : '오후';
        options.push({ value: timeValue, label: `${ampm} ${hourStr}:${minuteStr}` });
      }
    }
    return options;
  };

  const renderSingleTimeSelect = (type: 'start' | 'end') => {
    if (!includeTime) return null;
    const targetDate = type === 'start' ? startDate : endDate;
    if (!targetDate || !isValid(targetDate) || (type === 'end' && !showDeadline)) return null;

    const currentTimeValue = format(targetDate, 'HH:mm');
    const timeOptions = generateTimeOptions(10);

    const handleSingleTimeChange = (timeValue: string) => {
      if (!targetDate || !isValid(targetDate)) return;

      const [hour, minute] = timeValue.split(':').map(Number);
      let newDate = setMinutes(setHours(targetDate, hour), minute);

      if (type === 'start') {
        setStartDate(newDate);
        if (showDeadline && endDate && isValid(endDate) && newDate > endDate) setEndDate(newDate);
      } else {
        if (startDate && isValid(startDate) && newDate < startDate) {
          console.warn("마감 시간은 시작 시간보다 이전일 수 없습니다.");
          // setEndDate(startDate); // 시작 시간으로 강제 설정
          return;
        }
        setEndDate(newDate);
      }
    };
    return (
      <select
        value={currentTimeValue}
        onChange={e => handleSingleTimeChange(e.target.value)}
        className="time-select-combined"
      >
        {timeOptions.map(option => (
          <option key={`${type}-${option.value}`} value={option.value}>{option.label}</option>
        ))}
      </select>
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
                  {startDate && isValid(startDate)
                    ? renderSingleTimeSelect('start')
                    : <div className="time-placeholder">
                      <span>시작 시간</span>
                      <FontAwesomeIcon icon={faChevronDown} style={{ width: 9, height: 9, color: '#0F1B2A' }} />
                    </div>
                  }
                </div>
                <div className="date-time-row separate">
                  <DateInput
                    date={endDate}
                    setDate={setEndDate}
                    label="마감일"
                    locale={ko}
                  />
                  {endDate && isValid(endDate)
                    ? renderSingleTimeSelect('end')
                    : <div className="time-placeholder">
                      <span>마감 시간</span>
                      <FontAwesomeIcon icon={faChevronDown} style={{ width: 9, height: 9, color: '#0F1B2A' }} />
                    </div>
                  }
                </div>
              </>
            ) : (
              <div className="date-time-row separate">
                <DateInput
                  date={startDate}
                  setDate={setStartDate}
                  label="시작일"
                  locale={ko}
                />
                {startDate && isValid(startDate)
                  ? renderSingleTimeSelect('start')
                  : <div className="time-placeholder">
                    <span>시작 시간</span>
                    <FontAwesomeIcon icon={faChevronDown} style={{ width: 9, height: 9, color: '#0F1B2A' }} />
                  </div>
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
              <span className="slider round green" />
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
              <span className="slider round green" />
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default DateTimePicker;