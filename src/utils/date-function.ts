
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
  const month = date.getMonth();
  const day = date.getDate();

  const formattedMonth = String(month).padStart(2, "0");
  const formattedDay = String(day).padStart(2, "0");

  return `${year}.${formattedMonth}.${formattedDay}`;
};