// NumericDropdown.tsx
import useDropdown from "../../../../../hooks/use-dropdown"; // 경로는 실제 프로젝트에 맞게 조정해주세요.

interface NumericDropdownProps<T extends string | number> {
  title: string;
  currentValue: T;
  dropdownList: T[];
  onSelect: (value: T) => void;
}

const NumericDropdown = <T extends string | number>({
  title,
  currentValue,
  dropdownList,
  onSelect,
}: NumericDropdownProps<T>) => {
  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();

  const handleItemClick = (item: T) => {
    onSelect(item);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div ref={wrapperRef} onClick={toggle} className="task-detail__detail-modal-field-edit-numeric-row">
        <div className="task-detail__detail-modal-field-edit-numeric-label">{title}</div>
        <div className="task-detail__numeric-dropdown-current-value-wrapper">
          <div className="task-detail__numeric-dropdown-current-value">{currentValue}</div>
          <div className="task-detail__numeric-dropdown-arrow-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="#0F1B2A" className="bi bi-chevron-down" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
            </svg>
          </div>
        </div>
      </div>
      {isOpen && (
        <div ref={dropdownRef} className="select-dropdown-panel task-detail__numeric-dropdown-panel">
          {dropdownList.map(item => (
            <div
              key={String(item)}
              className="select-dropdown-item numeric-dropdown-item truncate"
              onClick={() => handleItemClick(item)}
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