import useDropdown from "../../../../../hooks/use-dropdown";

// MeasurementUnit 타입 등을 가져올 수 있다면 좋지만, 여기선 string | number로 유지
interface NumericDropdownProps<T extends string | number> {
  title: string;
  currentValue: T; // 드롭다운용 (레이블/위치에서는 다른 방식으로 값 전달)
  dropdownList: T[]; // 드롭다운용
  onSelect: (value: T) => void; // 드롭다운용

  // "레이블 입력" 용 Props
  customInputValue?: string;
  onCustomInputChange?: (value: string) => void;

  // "위치" 선택 용 Props
  labelPositionValue?: 'left' | 'right';
  onLabelPositionChange?: (value: 'left' | 'right') => void;
}

const NumericDropdown = <T extends string | number>({
  title,
  currentValue,
  dropdownList,
  onSelect,
  customInputValue,
  onCustomInputChange,
  labelPositionValue,
  onLabelPositionChange,
}: NumericDropdownProps<T>) => {

  if (title === '레이블 입력') {
    return (
      <div className="task-detail__detail-modal-field-edit-numeric-row">
        <div className="task-detail__detail-modal-field-edit-numeric-label">{title}</div>
        <div className="task-detail__numeric-dropdown-current-value-wrapper">
          {/* input 스타일은 필요에 따라 조정 */}
          <input
            type="text"
            className="task-detail__numeric-custom-label-input" // CSS 클래스 추가 가능
            style={{ width: '100%', border: 'none', outline: 'none', boxSizing: 'border-box' }}
            placeholder="사용자 레이블을 입력하세요"
            value={customInputValue || ""}
            onChange={(e) => onCustomInputChange?.(e.target.value)}
          />
        </div>
      </div>
    );
  }

  if (title === '위치') {
    const positions: Array<'left' | 'right'> = ['left', 'right'];
    return (
      <div className="task-detail__detail-modal-field-edit-numeric-row">
        <div className="task-detail__detail-modal-field-edit-numeric-label">{title}</div>
        <div style={{ display: 'flex', fontSize: 13, gap: 16, alignItems: 'center' }}>
          {positions.map(pos => (
            <div
              key={pos}
              style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}
              onClick={() => onLabelPositionChange?.(pos)}
              role="radio" // 접근성 향상
              aria-checked={labelPositionValue === pos}
              tabIndex={0} // 키보드 접근성
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLabelPositionChange?.(pos);}}
            >
              <div className="radio-icon-container">
                <div className={`radio-icon-outer ${labelPositionValue === pos ? 'radio-icon-outer--checked' : ''}`}>
                  <div className={`radio-icon-inner ${labelPositionValue === pos ? 'radio-icon-inner--checked' : ''}`} />
                </div>
              </div>
              <div style={{ lineHeight: '130%' }}>{pos === 'left' ? '왼쪽' : '오른쪽'}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- 기존 드롭다운 로직 ---
  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();

  const handleItemClick = (item: T) => {
    onSelect(item);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div onClick={toggle} className="task-detail__detail-modal-field-edit-numeric-row">
        <div className="task-detail__detail-modal-field-edit-numeric-label">{title}</div>
        <div className="task-detail__numeric-dropdown-current-value-wrapper">
          <div className="task-detail__numeric-dropdown-current-value">{currentValue}</div>
          <div className="task-detail__numeric-dropdown-arrow-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" className={`bi bi-chevron-down numeric-dropdown-arrow-icon ${isOpen ? 'numeric-dropdown-arrow-icon--open' : ''}`} viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
            </svg>
          </div>
        </div>
      </div>
      {isOpen && (
        <div ref={dropdownRef} className="select-dropdown-panel task-detail__numeric-dropdown-panel">
          {dropdownList.map(item => (
            <div
              key={String(item)} // key를 string으로 명시적 변환
              className="select-dropdown-item numeric-dropdown-item truncate"
              onClick={() => handleItemClick(item)}
              role="option"
              aria-selected={item === currentValue}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NumericDropdown;