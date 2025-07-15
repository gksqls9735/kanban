import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  addMonths, format, getHours, getMinutes, isAfter, isBefore, isSameDay,
  isValid, setHours, setMinutes, startOfDay, startOfMonth, subMonths
} from "date-fns";
import { ko } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import DateInput from "./date-input";
import CustomTimeSelect from "./custom-time-select";
import CalendarView from "./common/calendar-view";

interface DateTimePickerProps {
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
  initialIncludeTime?: boolean;
  initialShowDeadline?: boolean;
  onUnmount: (stateDate: Date | null, endDate: Date | null) => void;
  minStart?: Date | null;
}


const DateTimePicker: React.FC<DateTimePickerProps> = ({
  initialStartDate = null,
  initialEndDate = null,
  initialIncludeTime = false,
  initialShowDeadline = false,
  onUnmount,
  minStart
}) => {
  const [tempCurrentMonth, setTempCurrentMonth] = useState<Date>(initialStartDate ? startOfMonth(initialStartDate) : new Date());
  const [tempStartDate, setTempStartDate] = useState<Date | null>(initialStartDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(initialShowDeadline ? initialEndDate : null); // 마감일 표시 여부에 따라 초기화
  const [tempShowDeadline, setTempShowDeadline] = useState<boolean>(initialShowDeadline);
  const [tempIncludeTime, setTempIncludeTime] = useState<boolean>(initialIncludeTime);

  const latestStateRef = useRef({
    startDate: tempStartDate,
    endDate: tempEndDate,
    showDeadline: tempShowDeadline,
    includeTime: tempIncludeTime,
  });

  useEffect(() => {
    latestStateRef.current = {
      startDate: tempStartDate, endDate: tempEndDate, showDeadline: tempShowDeadline, includeTime: tempIncludeTime,
    };
  }, [tempStartDate, tempEndDate, tempShowDeadline, tempIncludeTime]);

  useEffect(() => {
    return () => {
      const { startDate, endDate, showDeadline, includeTime } = latestStateRef.current;
      let finalStartDate = startDate;
      let finalEndDate = endDate;

      if (!includeTime) {
        if (finalStartDate) finalStartDate = startOfDay(finalStartDate);
        if (finalEndDate) finalEndDate = startOfDay(finalEndDate);
      }

      onUnmount(finalStartDate, showDeadline ? finalEndDate : null);
    };
  }, []);

  // 날짜 클릭
  const handleDateClick = (day: Date) => {
    let newClickedDateWithTime = tempIncludeTime
      ? setMinutes(setHours(day, tempStartDate ? getHours(tempStartDate) : 0), tempStartDate ? getMinutes(tempStartDate) : 0)
      : startOfDay(day);

    // minStart와 같은 날짜를 선택했고, 시간이 minStart보다 이전이면 minStart 시간으로 조정
    if (minStart && isValid(minStart) && isSameDay(newClickedDateWithTime, minStart) && isBefore(newClickedDateWithTime, minStart)) {
      newClickedDateWithTime = minStart;
    }

    // --- 여기에 showDeadline 로직 추가 ---
    if (!tempShowDeadline) { // 마감일 기능을 사용하지 않는 경우 (단일 날짜 선택)
      setTempStartDate(newClickedDateWithTime);
      setTempEndDate(null);
      return; // 단일 날짜 선택 모드에서는 여기서 로직 종료
    }
    // --- showDeadline 로직 끝 ---

    // 마감일 기능 사용 시 (아래는 두 번째 로직의 범위 선택 부분)
    if (tempStartDate && tempEndDate) {
      if (isBefore(newClickedDateWithTime, tempEndDate)) {
        setTempStartDate(newClickedDateWithTime);
      } else {
        setTempStartDate(newClickedDateWithTime);
        setTempEndDate(null);
      }
    } else if (tempStartDate && !tempEndDate) {
      const startDateWithoutTime = startOfDay(tempStartDate);
      const clickedDayWithoutTime = startOfDay(day);

      if (isBefore(clickedDayWithoutTime, startDateWithoutTime)) {
        setTempStartDate(newClickedDateWithTime);
      } else {
        let endDateWithTime = tempIncludeTime
          ? setMinutes(setHours(day, tempEndDate ? getHours(tempEndDate) : (tempIncludeTime && tempStartDate ? getHours(tempStartDate) : 0)), tempEndDate ? getMinutes(tempEndDate) : (tempIncludeTime && tempStartDate ? getMinutes(tempStartDate) : 0))
          : startOfDay(day);

        if (tempStartDate && isValid(tempStartDate) && isBefore(endDateWithTime, tempStartDate)) {
          console.warn("마감 시간은 시작 시간보다 이전일 수 없습니다. 시작 시간으로 조정합니다.");
          endDateWithTime = tempStartDate;
        }
        setTempEndDate(endDateWithTime);
      }
    } else {
      setTempStartDate(newClickedDateWithTime);
      setTempEndDate(null);
    }
  };

  // 월 이동
  // 이전 달 이동
  const prevMonth = () => setTempCurrentMonth(subMonths(tempCurrentMonth, 1));
  const nextMonth = () => setTempCurrentMonth(addMonths(tempCurrentMonth, 1));

  // 토글 핸들러
  // 마감일
  const handleDeadlineToggle = () => {
    const newState = !tempShowDeadline;
    setTempShowDeadline(newState);
    if (!newState) {
      setTempEndDate(null);
    }
  };

  // 시간 포함 토글 핸들러
  const handleTimeToggle = () => {
    const newState = !tempIncludeTime;
    setTempIncludeTime(newState);
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
    if (!tempIncludeTime) return null;
    const targetDate = type === 'start' ? tempStartDate : tempEndDate;
    if (!targetDate || !isValid(targetDate)) return null;

    const currentTimeValue = format(targetDate, 'HH:mm');
    let timeOptions = generateTimeOptions(30);

    // minStart 시간 제약 (시작 시간 드롭다운에만 적용)
    if (type === 'start' && minStart && isValid(minStart) && isSameDay(targetDate, minStart)) {
      timeOptions = timeOptions.filter(option => {
        const [optionHour, optionMinute] = option.value.split(':').map(Number);
        const optionDateTime = setMinutes(setHours(startOfDay(targetDate), optionHour), optionMinute);
        return !isBefore(optionDateTime, minStart);
      });
    }

    // 마감 시간은 시작 시간보다 이전일 수 없음 (마감 시간 드롭다운에만 적용, 동일 날짜에만 유효)
    if (type === 'end' && tempStartDate && isValid(tempStartDate) && isSameDay(targetDate, tempStartDate)) {
      timeOptions = timeOptions.filter(option => {
        const [optionHour, optionMinute] = option.value.split(':').map(Number);
        const optionDateTime = setMinutes(setHours(startOfDay(targetDate), optionHour), optionMinute);
        return !isBefore(optionDateTime, tempStartDate);
      });
    }

    const handleSingleTimeChange = (timeValue: string) => {
      if (!targetDate || !isValid(targetDate)) return;

      const [hour, minute] = timeValue.split(':').map(Number);
      let newDate = setMinutes(setHours(targetDate, hour), minute);

      if (type === 'start') {
        // minStart 시간 검사
        if (minStart && isValid(minStart) && isBefore(newDate, minStart)) {
          console.warn("시작 시간은 최소 시작 가능 시간보다 이전일 수 없습니다.");
          return; // 변경을 막고 경고
        }
        setTempStartDate(newDate);
        // 시작 시간이 마감 시간보다 늦어지면 마감 시간도 시작 시간으로 조정
        if (tempEndDate && isValid(tempEndDate) && isAfter(newDate, tempEndDate)) {
          (newDate);
        }
      } else { // type === 'end'
        // 마감 시간이 시작 시간보다 이전일 수 없음
        if (tempStartDate && isValid(tempStartDate) && isBefore(newDate, tempStartDate)) {
          console.warn("마감 시간은 시작 시간보다 이전일 수 없습니다.");
          return; // 변경을 막고 경고
        }
        (newDate);
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
        {/** 상단 날짜/시간 표시 및 선택 */}
        <div className="selected-info">
          {!tempIncludeTime && (
            <div className={`date-time-row ${tempShowDeadline ? 'separate' : ''}`}>
              <DateInput
                date={tempStartDate}
                setDate={setTempStartDate}
                label="시작일"
                locale={ko}
              />
              {tempShowDeadline && (
                <DateInput
                  date={tempEndDate}
                  setDate={setTempEndDate}
                  label="마감일"
                  locale={ko}
                />
              )}
            </div>
          )}

          {tempIncludeTime && (
            tempShowDeadline ? (
              <>
                <div className="date-time-row separate">
                  <DateInput
                    date={tempStartDate}
                    setDate={setTempStartDate}
                    label="시작일"
                    locale={ko}
                  />
                  {tempStartDate && isValid(tempStartDate)
                    ? renderSingleTimeSelect('start')
                    : <div className="time-placeholder">
                      <span>시작 시간</span>
                      <FontAwesomeIcon icon={faChevronDown} style={{ width: 9, height: 9, color: '#0F1B2A' }} />
                    </div>
                  }
                </div>
                <div className="date-time-row separate">
                  <DateInput
                    date={tempEndDate}
                    setDate={setTempEndDate}
                    label="마감일"
                    locale={ko}
                  />
                  {tempEndDate && isValid(tempEndDate)
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
                  date={tempStartDate}
                  setDate={setTempStartDate}
                  label="시작일"
                  locale={ko}
                />
                {tempStartDate && isValid(tempStartDate)
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

        <CalendarView
          currentMonth={tempCurrentMonth}
          startDate={tempStartDate}
          endDate={tempEndDate}
          minStart={minStart}
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
                checked={tempShowDeadline}
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
                checked={tempIncludeTime}
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