import React from 'react';
import { format, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import useDropdown from '../../../hooks/use-dropdown';

const CustomTimeSelect: React.FC<{
  currentTimeValue: string;
  handleSingleTimeChange: (value: string) => void;
  timeOptions: { value: string; label: string; }[];
  targetDate: Date | null;
  type: string;
}> = ({ currentTimeValue, handleSingleTimeChange, timeOptions, targetDate, type }) => {
  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();

  const handleOptionClick = (value: string) => {
    handleSingleTimeChange(value);
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    const selectedOption = timeOptions.find(option => option.value === currentTimeValue);
    if (selectedOption) return selectedOption.label;
    if (targetDate && isValid(targetDate)) return format(targetDate, 'a h:mm', { locale: ko });
    return '';
  };

  return (
    <div className='custom-time-select-container' ref={wrapperRef}>
      <div className='custom-select-trigger' onClick={toggle}>
        {getDisplayValue()}
        <span className='custom-select-arrow-icon' />
      </div>
      {isOpen && (
        <div className='custom-select-options' ref={dropdownRef}>
          <ul>
            {!timeOptions.some(option => option.value === currentTimeValue) && targetDate && isValid(targetDate) && (
              <li onClick={() => handleOptionClick(currentTimeValue)}>{format(targetDate, 'a h:m', { locale: ko })}</li>
            )}
            {timeOptions.map(option => (
              <li
                key={`${type}-${option.value}`}
                onClick={() => handleOptionClick(option.value)}
                className={option.value === currentTimeValue ? 'selected' : ''}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomTimeSelect;
