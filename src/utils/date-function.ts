import { format } from "date-fns";
import { ko } from "date-fns/locale";

export const formatKoreanDateSimple = (date: Date): string => {
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const dateStr = `${y}.${m}.${d}`;

  const h = date.getHours();
  const min = date.getMinutes();

  if (h !== 0 || min !== 0 || date.getSeconds() !== 0) {
    const formattedH = h.toString().padStart(2, '0');
    const formattedMin = min.toString().padStart(2, '0');
    return `${dateStr}, ${formattedH}:${formattedMin}`;
  }

  return dateStr;
};

export const formatDateToYyyyMmDd = (dateInput: Date) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    console.error("Invalid date input:", dateInput);
    return '유효하지 않은 날짜';
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const formattedMonth = String(month).padStart(2, "0");
  const formattedDay = String(day).padStart(2, "0");

  const dateStr = `${year}.${formattedMonth}.${formattedDay}`;

  const hours = date.getHours();
  const minutes = date.getMinutes();

  const isMidNight = hours === 0 && minutes === 0;

  if (isMidNight) {
    return dateStr;
  } else {
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    return `${dateStr}, ${formattedHours}:${formattedMinutes}`;
  }

};

export const formatToKoreanDateTimeString = (date: Date) => {
  return format(date, 'yyyy.MM.dd, aaaa hh:mm', { locale: ko })
}

export const formatDateToKoreanDeadline = (date: Date | string | null | undefined): string => {
  if (!date) return '기한 없음';

  let dateObject: Date;

  if (typeof date === 'string') dateObject = new Date(date);
  else if (date instanceof Date) dateObject = date;
  else { return '기한 없음'; }

  if (isNaN(dateObject.getTime())) return '기한 없음';

  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, '0');
  const day = String(dateObject.getDate()).padStart(2, '0');

  return `${year}년 ${month}월 ${day}일까지`;
}

export const formatTimeToHHMM = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.warn("Invalid Date object provided to formatTimeToHHMM. Returning '00:00'.");
    return "00:00";
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');

  return `${formattedHours} : ${formattedMinutes}`;
}