import { addMonths, getHours, getMinutes, isBefore, isSameDay, isValid, setHours, setMinutes, startOfDay, startOfMonth, subMonths } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";

export interface DateTimePickerProps {
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
  initialIncludeTime?: boolean;
  initialShowDeadline?: boolean;
  onUnmount: (stateDate: Date | null, endDate: Date | null) => void;
  minStart?: Date | null;
}

export const useDateTimePicker = ({
  initialStartDate = null,
  initialEndDate = null,
  initialIncludeTime = false,
  initialShowDeadline = false,
  onUnmount,
  minStart
}: DateTimePickerProps) => {
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
  const handleDateClick = useCallback((day: Date) => {
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
  }, [tempIncludeTime, tempStartDate, minStart, tempShowDeadline, tempEndDate]);

  // 월 이동
  // 이전 달 이동
  const prevMonth = useCallback(() => setTempCurrentMonth(subMonths(tempCurrentMonth, 1)), [tempCurrentMonth]);
  const nextMonth = useCallback(() => setTempCurrentMonth(addMonths(tempCurrentMonth, 1)), [tempCurrentMonth]);

  // 토글 핸들러
  // 마감일
  const handleDeadlineToggle = useCallback(() => {
    const newState = !tempShowDeadline;
    setTempShowDeadline(newState);
    if (!newState) setTempEndDate(null);
  }, [tempShowDeadline]);

  // 시간 포함 토글 핸들러
  const handleTimeToggle = useCallback(() => {
    const newState = !tempIncludeTime;
    setTempIncludeTime(newState);
  }, [tempIncludeTime]);

  return {
    tempCurrentMonth, tempStartDate, tempEndDate, tempShowDeadline, tempIncludeTime, calcMinStart: minStart,
    setTempStartDate, setTempEndDate,
    handleDateClick, prevMonth, nextMonth, handleDeadlineToggle, handleTimeToggle,
  }
};