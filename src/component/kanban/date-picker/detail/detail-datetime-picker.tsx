import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  format, getHours, getMinutes, isAfter, isBefore,
  isSameDay, isValid, setHours, setMinutes, startOfDay
} from "date-fns";
import { ko } from "date-fns/locale";
import React from "react"; // Added React import
import { DateTimePickerProps, useDateTimePicker } from "../../../../hooks/date-time-picker/detail/use-detail-date-time-picker";
import CustomTimeSelect from "../custom-time-select";
import DateInput from "../date-input";
import CalendarView from "../common/calendar-view";

const DatailDateTimePicker: React.FC<DateTimePickerProps> = (props) => {
  const {
    startDate, setStartDate,
    endDate, setEndDate,
    includeTime,
    mode,
    showDeadline,
    currentMonth,
    calcMinStart,
    handleDateClick,
    handleTimeToggle,
    handleDeadlineToggle,
    prevMonth,
    nextMonth,
  } = useDateTimePicker(props);

  // 시간 옵션 생성 (30분 단위)
  const generateTimeOptions = (intervalMinutes = 10) => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        const hourStr = h.toString().padStart(2, '0');
        const minuteStr = m.toString().padStart(2, '0');
        const timeValue = `${hourStr}:${minuteStr}`;
        const ampm = h < 12 ? '오전' : '오후';
        options.push({ value: timeValue, label: `${ampm} ${h % 12 || 12}:${minuteStr}` }); // 12시간 표기법
      }
    }
    return options;
  };

  // 단일 시간 선택 드롭다운 렌더링
  const renderSingleTimeSelect = (type: 'start' | 'end') => {
    if (!includeTime) return null;
    const targetDate = type === 'start' ? startDate : endDate;
    if (!targetDate || !isValid(targetDate)) return null;

    const currentTimeValue = format(targetDate, 'HH:mm');
    let timeOptions = generateTimeOptions();

    // minStart 시간 제약 (시작 시간 드롭다운에만 적용)
    if (type === 'start' && calcMinStart && isValid(calcMinStart) && isSameDay(targetDate, calcMinStart)) {
      timeOptions = timeOptions.filter(option => {
        const [optionHour, optionMinute] = option.value.split(':').map(Number);
        const optionDateTime = setMinutes(setHours(startOfDay(targetDate), optionHour), optionMinute);
        return !isBefore(optionDateTime, calcMinStart);
      });
    }

    // 마감 시간은 시작 시간보다 이전일 수 없음 (마감 시간 드롭다운에만 적용, 동일 날짜에만 유효)
    if (type === 'end' && startDate && isValid(startDate) && isSameDay(targetDate, startDate)) {
      timeOptions = timeOptions.filter(option => {
        const [optionHour, optionMinute] = option.value.split(':').map(Number);
        const optionDateTime = setMinutes(setHours(startOfDay(targetDate), optionHour), optionMinute);
        return !isBefore(optionDateTime, startDate);
      });
    }

    const handleSingleTimeChange = (timeValue: string) => {
      if (!targetDate || !isValid(targetDate)) return;

      const [hour, minute] = timeValue.split(':').map(Number);
      let newDate = setMinutes(setHours(targetDate, hour), minute);

      if (type === 'start') {
        // minStart 시간 검사
        if (calcMinStart && isValid(calcMinStart) && isBefore(newDate, calcMinStart)) {
          console.warn("시작 시간은 최소 시작 가능 시간보다 이전일 수 없습니다.");
          return; // 변경을 막고 경고
        }
        setStartDate(newDate);
        // 시작 시간이 마감 시간보다 늦어지면 마감 시간도 시작 시간으로 조정
        if (endDate && isValid(endDate) && isAfter(newDate, endDate)) {
          setEndDate(newDate);
        }
      } else { // type === 'end'
        // 마감 시간이 시작 시간보다 이전일 수 없음
        if (startDate && isValid(startDate) && isBefore(newDate, startDate)) {
          console.warn("마감 시간은 시작 시간보다 이전일 수 없습니다.");
          return; // 변경을 막고 경고
        }
        setEndDate(newDate);
      }
    };
    return (
      <CustomTimeSelect
        currentTimeValue={currentTimeValue}
        handleSingleTimeChange={handleSingleTimeChange}
        timeOptions={timeOptions}
        targetDate={targetDate}
        type={type}
      />
    );
  };

  return (
    <>
      <div className="datetime-picker-container">
        <div className="selected-info">
          {!includeTime && (
            <div className={`date-time-row ${showDeadline ? 'separate' : ''}`}>
              <DateInput date={startDate} setDate={date => {
                const newDate = date ? startOfDay(date) : null;
                if (calcMinStart && newDate && isBefore(newDate, startOfDay(calcMinStart))) {
                  setStartDate(startOfDay(calcMinStart));
                  if (endDate && isAfter(startOfDay(calcMinStart), endDate)) setEndDate(startOfDay(calcMinStart));
                } else {
                  setStartDate(newDate);
                  if (newDate && endDate && isAfter(newDate, endDate)) setEndDate(newDate);
                }
              }} label="시작일" locale={ko} />
              {showDeadline && (
                <DateInput date={endDate} setDate={date => {
                  const newDate = date ? startOfDay(date) : null;
                  if (calcMinStart && newDate && isBefore(newDate, startOfDay(calcMinStart))) {
                    setEndDate(startOfDay(calcMinStart));
                    if (startDate && isBefore(startOfDay(calcMinStart), startDate)) setStartDate(startOfDay(calcMinStart));
                  } else {
                    setEndDate(newDate);
                    if (newDate && startDate && isBefore(newDate, startDate)) setStartDate(newDate);
                  }
                }} label="마감일" locale={ko} />
              )}
            </div>
          )}
          {includeTime && (
            <>
              <div className="date-time-row separate">
                <DateInput date={startDate} setDate={date => {
                  const newDateWithTime = date ? setMinutes(setHours(date, startDate ? getHours(startDate) : 0), startDate ? getMinutes(startDate) : 0) : null;
                  if (calcMinStart && newDateWithTime && isBefore(newDateWithTime, calcMinStart)) {
                    setStartDate(calcMinStart);
                    if (endDate && isAfter(calcMinStart, endDate)) setEndDate(calcMinStart);
                  } else {
                    setStartDate(newDateWithTime);
                    if (newDateWithTime && endDate && isAfter(newDateWithTime, endDate)) setEndDate(newDateWithTime);
                  }
                }} label="시작일" locale={ko} />
                {startDate ? renderSingleTimeSelect('start') : <div className="time-placeholder"><span>시작 시간</span><FontAwesomeIcon icon={faChevronDown} style={{ width: 9, height: 9 }} /></div>}
              </div>
              {showDeadline && (
                <div className="date-time-row separate">
                  <DateInput date={endDate} setDate={date => {
                    const baseTime = endDate || startDate;
                    const newDateWithTime = date ? setMinutes(setHours(date, baseTime ? getHours(baseTime) : 0), baseTime ? getMinutes(baseTime) : 0) : null;
                    if (calcMinStart && newDateWithTime && isBefore(newDateWithTime, calcMinStart)) {
                      setEndDate(calcMinStart);
                      if (startDate && isBefore(calcMinStart, startDate)) setStartDate(calcMinStart);
                    } else {
                      setEndDate(newDateWithTime);
                      if (newDateWithTime && startDate && isBefore(newDateWithTime, startDate)) setStartDate(newDateWithTime);
                    }
                  }} label="마감일" locale={ko} />
                  {endDate ? renderSingleTimeSelect('end') : <div className="time-placeholder"><span>마감 시간</span><FontAwesomeIcon icon={faChevronDown} style={{ width: 9, height: 9 }} /></div>}
                </div>
              )}
            </>
          )}
        </div>

        <CalendarView
          currentMonth={currentMonth}
          startDate={startDate}
          endDate={endDate}
          minStart={calcMinStart}
          mode={mode}
          onDateClick={handleDateClick}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />

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

export default DatailDateTimePicker;