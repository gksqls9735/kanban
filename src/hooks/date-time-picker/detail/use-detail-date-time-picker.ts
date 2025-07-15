import { addMonths, getHours, getMinutes, isAfter, isBefore, isValid, setHours, setMinutes, startOfDay, startOfMonth, subMonths } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";

export interface DateTimePickerProps {
  initialStartDate?: Date | null;
  initialEndDate?: Date | null; // Kept for setting a range
  initialIncludeTime?: boolean;
  initialShowDeadline?: boolean;
  onChange?: (startDate: Date | undefined, endDate: Date | undefined) => void;
  minStart?: Date | null;
  dateType?: 'start' | 'end' | 'none';
}


export const useDateTimePicker = ({
  initialStartDate = null,
  initialEndDate = null,
  initialIncludeTime = false,
  initialShowDeadline = false,
  onChange,
  minStart,
  dateType = 'none',
}: DateTimePickerProps) => {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate); // endDate state is kept
  const [includeTime, setIncludeTime] = useState<boolean>(initialIncludeTime);
  const [mode, setMode] = useState<'start' | 'end' | 'none'>(dateType);
  const [showDeadline, setShowDeadline] = useState<boolean>(initialShowDeadline);

  const isInitialMount = useRef<boolean>(true);

  const initialMonth =
    dateType === 'start' && initialStartDate
      ? startOfMonth(initialStartDate)
      : dateType === 'end' && initialEndDate
        ? startOfMonth(initialEndDate)
        : startOfMonth(new Date());

  const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth);

  const handleNoneModeDateClick = useCallback((clickedDate: Date) => {
    // 시작일이 아직 없는 경우 -> 무조건 시작일로 설정
    if (!startDate) {
      setStartDate(clickedDate);
      setEndDate(null);
      return;
    }

    // 시작일은 있는데 마감일이 없는 경우(마감일을 설정)
    if (startDate && !endDate) {
      if (isBefore(clickedDate, startDate)) {
        setStartDate(clickedDate);
      } else {
        setEndDate(clickedDate);
      }
      return;
    }

    // 시작일과 마감일이 모두 있는 경우 -> 새로운 범위 선택 시작으로 간주
    if (startDate && endDate) {
      setStartDate(clickedDate);
      setEndDate(null);
    }
  }, [startDate, endDate]);

  const handleDateClick = useCallback((day: Date) => {
    // 클릭한 날짜에 기존 기산 정보가 있다면 합치기
    let clickedDateWithTime = includeTime && startDate
      ? setMinutes(setHours(day, getHours(startDate)), getMinutes(startDate))
      : startOfDay(day);

    // 최소 시작일 제약조건
    if (minStart && isValid(minStart) && isBefore(clickedDateWithTime, minStart)) clickedDateWithTime = minStart;

    if (mode === "start") {
      if (endDate && isAfter(clickedDateWithTime, endDate)) {
        // 새로 시작한 시작일이 마감일보다 늦으면, 마감일을 초기화하고 새로운 범위 선택 시작
        setStartDate(clickedDateWithTime);
        setEndDate(null);
        setMode('none');  // 모드를 다시 'none'로 변경하여 다음 클릭이 마감일이 되도록 유도
      } else {
        setStartDate(clickedDateWithTime);
      }
    } else if (mode === "end") {
      if (startDate && isBefore(clickedDateWithTime, startDate)) {
        // 시작일 이전 날짜를 클릭하면 아무 작업도 하지 않고 무시
        if (startDate && isBefore(clickedDateWithTime, startDate)) {
          console.warn("마감일은 시작일보다 이전일 수 없습니다.");
          return;
        }
        // 유효한 날짜만 마감일로 설정합니다.
        setEndDate(clickedDateWithTime);
      } else {
        setEndDate(clickedDateWithTime);
      }
    } else {
      handleNoneModeDateClick(clickedDateWithTime);
    }
  }, [includeTime, startDate, minStart, mode, endDate, handleNoneModeDateClick]);

  // 월 이동 핸들러
  const prevMonth = useCallback(() => setCurrentMonth(subMonths(currentMonth, 1)), [currentMonth]);
  const nextMonth = useCallback(() => setCurrentMonth(addMonths(currentMonth, 1)), [currentMonth]);

  // 시간 포함 토글 핸들러
  const handleTimeToggle = useCallback(() => {
    setIncludeTime(prev => {
      const newState = !prev;
      if (!newState) {
        if (startDate) setStartDate(startOfDay(startDate));
        if (endDate) setEndDate(startOfDay(endDate));
      }
      return newState;
    });
  }, [startDate, endDate]);

  // 마감일 토글 핸들러
  const handleDeadlineToggle = useCallback(() => {
    setShowDeadline(prev => {
      const newState = !prev;
      if (!newState) {
        setEndDate(null);
      }
      return newState;
    });
  }, []);

  // 외부로 변경사항을 알리는 useEffect
  useEffect(() => {
    // ✅ 첫 렌더링 시에는 onChange를 호출하지 않도록 방지
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onChange?.(startDate ?? undefined, endDate ?? undefined);
  }, [startDate, endDate, onChange]);

  return {
    // 상태
    startDate,
    endDate,
    includeTime,
    mode,
    showDeadline,
    currentMonth,
    calcMinStart: minStart,
    // 상태 변경 함수
    setStartDate,
    setEndDate,
    setMode,
    // 핸들러
    handleDateClick,
    handleTimeToggle,
    handleDeadlineToggle,
    prevMonth,
    nextMonth,
  };
};