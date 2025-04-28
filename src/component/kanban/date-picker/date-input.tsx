import React from 'react';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons'; 

interface DateInputProps {
  date: Date | null;
  setDate: (date: Date | null) => void;
  label: string;
  locale: any;
  dateFormat?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  date,
  setDate,
  label,
  locale,
  dateFormat = 'yyyy.MM.dd',
}) => {
  const displayValue = date ? format(date, dateFormat, { locale }) : label;
  const inputClassName = `date-input ${date ? 'selected' : ''}`;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(null);
  };

  return (
    <div className='date-input-wrapper'>
      <input
        type="text"
        readOnly
        value={displayValue}
        placeholder={label}
        className={inputClassName}
        style={{color: `${date ? '#0F1B2A' : '#8D99A8'}`}}
      />
      {date && (
        <div
          onClick={handleClear}
          className="clear-date-button"
          title={`Clear ${label}`}
        >
          <FontAwesomeIcon icon={faTimes} style={{ width: 10, height: 10, color: 'white' }} />
        </div>
      )}
    </div>
  );
};

export default DateInput;