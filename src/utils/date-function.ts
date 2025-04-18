
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