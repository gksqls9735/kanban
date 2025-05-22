import useDropdown from "../../../../../hooks/use-dropdown";

const NumericDropdown: React.FC<{
  title: string;
  currentValue: any;
  dropdownList: any[];
}> = ({
  title, currentValue, dropdownList
}) => {
    const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
    return (
      <div className="relative">
        <div ref={wrapperRef} onClick={toggle} className="task-detail__detail-modal-field-edit-numeric-row">
          <div className="task-detail__detail-modal-field-edit-numeric-label">{title}</div>
          <div className="task-detail__numeric-dropdown-current-value-wrapper">
            <div className="task-detail__numeric-dropdown-current-value">{currentValue}</div>
            <div className="task-detail__numeric-dropdown-arrow-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="#0F1B2A" className="bi bi-chevron-down" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
              </svg>
            </div>
          </div>
        </div>
        {isOpen && (
          <div ref={dropdownRef} className="select-dropdown-panel task-detail__numeric-dropdown-panel">
            {dropdownList.map(item => (
              <div className="select-dropdown-item numeric-dropdown-item truncate">{item}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

export default NumericDropdown;