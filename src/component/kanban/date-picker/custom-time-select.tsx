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
    <>
      <style>{style}</style>
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
    </>
  );
};

export default CustomTimeSelect;

const style = `
/* 컨테이너 */
.custom-time-select-container {
  position: relative; /* 옵션 목록 위치 지정을 위해 */
  width: 100%; /* 부모에 맞게 너비 조절 */
  min-width: 0; /* flex-grow와 함께 사용 시 */
  flex-grow: 1; /* 부모 flex 컨테이너 내에서 공간 차지 */
  box-sizing: border-box;
}

/* 드롭다운 트리거 (현재 선택된 시간 표시되는 부분) */
.custom-select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  border: 1px solid rgba(228, 232, 238, 1);
  border-radius: 4px;
  font-size: 13px;
  background-color: #fff;
  height: 36px;
  cursor: pointer;
  color: #0F1B2A;
  white-space: nowrap; /* 텍스트가 줄바꿈되지 않도록 */
  overflow: hidden; /* 넘치는 텍스트 숨김 */
  text-overflow: ellipsis; /* 넘치는 텍스트 ... 처리 */
}

/* 화살표 아이콘 (CSS로 만들거나 SVG 사용) */
.custom-select-trigger .custom-select-arrow-icon {
  width: 10px;
  height: 6px;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%3E%3Cpolyline%20points%3D%221%2C1%205%2C5%209%2C1%22%20stroke%3D%22%23666666%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  margin-left: 8px; /* 텍스트와 화살표 사이 간격 */
}

/* 드롭다운 옵션 목록 컨테이너 */
.custom-select-options {
  position: absolute;
  top: 50%; /* 트리거 바로 아래에 위치 */
  left: 90%;
  width: 152px;
  max-height: 196px; /* 최대 높이 설정 (스크롤바를 위해) */
  overflow-y: auto; /* 내용이 넘칠 경우 스크롤 */
  border-radius: 4px;
  padding: 8px 0px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
  z-index: 1000; /* 다른 요소 위에 표시되도록 */
}

.custom-select-options ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.custom-select-options li {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #0F1B2A;
}

.custom-select-options li:hover {
  background-color: #f0f0f0; /* 호버 시 배경색 */
}

.custom-select-options li.selected {
  background-color: #ECFDF3; /* 선택된 항목 배경색 */
}

/* 스크롤바 커스터마이징 (Webkit 브라우저 - Chrome, Safari 등) */
.custom-select-options::-webkit-scrollbar {
  width: 5px; /* gantt-scrollbar-y와 동일하게 5px */
  height: 0px; /* 세로 스크롤바이므로 가로는 0 */
}

.custom-select-options::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2); /* gantt-scrollbar-y와 동일 */
  border-radius: 3px; /* gantt-scrollbar-y와 동일 */
}

.custom-select-options::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.1); /* gantt-scrollbar-y와 동일 */
}

.custom-select-options::-webkit-scrollbar-track {
  /* gantt-scrollbar-y는 track에 border-radius만 있지만, 보통 track도 배경색을 가집니다. */
  /* 필요에 따라 track 배경색을 추가하거나 제거하세요. */
  background-color: transparent; /* 트랙 배경색을 투명하게 설정하여 더 깔끔하게 보일 수 있습니다. */
  border-radius: 10px; /* gantt-scrollbar-y와 동일 */
}

.custom-select-options::-webkit-scrollbar-button {
  display: none; /* gantt-scrollbar-y와 동일 */
}
`