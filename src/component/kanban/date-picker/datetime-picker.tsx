import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  format, isAfter, isBefore, isSameDay,
  isValid, setHours, setMinutes, startOfDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import DateInput from "./date-input";
import CustomTimeSelect from "./custom-time-select";
import CalendarView from "./common/calendar-view";
import { useDateTimePicker } from "../../../hooks/date-time-picker/card/use-date-time-picker";

interface DateTimePickerProps {
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
  initialIncludeTime?: boolean;
  initialShowDeadline?: boolean;
  onUnmount: (stateDate: Date | null, endDate: Date | null) => void;
  minStart?: Date | null;
}


const DateTimePicker: React.FC<DateTimePickerProps> = (props) => {
  const {
    tempCurrentMonth, tempStartDate, tempEndDate, tempShowDeadline, tempIncludeTime, calcMinStart: minStart,
    setTempStartDate, setTempEndDate,
    handleDateClick, prevMonth, nextMonth, handleDeadlineToggle, handleTimeToggle,
  } = useDateTimePicker(props)
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
          setTempEndDate(newDate);
        }
      } else { // type === 'end'
        // 마감 시간이 시작 시간보다 이전일 수 없음
        if (tempStartDate && isValid(tempStartDate) && isBefore(newDate, tempStartDate)) {
          console.warn("마감 시간은 시작 시간보다 이전일 수 없습니다.");
          return; // 변경을 막고 경고
        }
        setTempEndDate(newDate);
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
          {/* Case 1: 시간을 포함하지 않는 경우 */}
          {!tempIncludeTime && (
            <div className={`date-time-row ${tempShowDeadline ? 'separate' : ''}`}>
              <DateInput
                date={tempStartDate}
                setDate={setTempStartDate}
                label="시작일"
                locale={ko}
              />
              {/* 마감일은 tempShowDeadline에 따라서만 결정 */}
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

          {/* Case 2: 시간을 포함하는 경우 */}
          {tempIncludeTime && (
            <>
              {/* 시작일/시간 행은 항상 렌더링 */}
              <div className="date-time-row separate">
                <DateInput
                  date={tempStartDate}
                  setDate={setTempStartDate}
                  label="시작일"
                  locale={ko}
                />
                {tempStartDate && isValid(tempStartDate)
                  ? renderSingleTimeSelect('start')
                  : (
                    <div className="time-placeholder">
                      <span>시작 시간</span>
                      <FontAwesomeIcon icon={faChevronDown} style={{ width: 9, height: 9, color: '#0F1B2A' }} />
                    </div>
                  )
                }
              </div>

              {/* 마감일/시간 행은 tempShowDeadline에 따라서만 결정 */}
              {tempShowDeadline && (
                <div className="date-time-row separate">
                  <DateInput
                    date={tempEndDate}
                    setDate={setTempEndDate}
                    label="마감일"
                    locale={ko}
                  />
                  {tempEndDate && isValid(tempEndDate)
                    ? renderSingleTimeSelect('end')
                    : (
                      <div className="time-placeholder">
                        <span>마감 시간</span>
                        <FontAwesomeIcon icon={faChevronDown} style={{ width: 9, height: 9, color: '#0F1B2A' }} />
                      </div>
                    )
                  }
                </div>
              )}
            </>
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