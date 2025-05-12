import { SelectOption } from "../../../types/type";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { lightenColor } from "../../../utils/color-function";
import useDropdown from "../../../hooks/use-dropdown";
import { truncateText } from "../../../utils/text-function";

const OptionSelector: React.FC<{
  options: SelectOption[];
  selectedOption: SelectOption;
  onSelect: (option: SelectOption) => void;
}> = ({ options, selectedOption, onSelect }) => {
  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();

  const handleSelect = (option: SelectOption) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="card-select-wrapper">
      <div ref={wrapperRef} className="card-priority-status-current " onClick={toggle}
        style={{ color: selectedOption.colorMain, backgroundColor: selectedOption.colorSub || lightenColor(selectedOption.colorMain, 0.85), cursor: 'pointer' }}
      >
        {truncateText(selectedOption.name, 2)}
        <FontAwesomeIcon icon={faCaretDown} style={{ width: 12, height: 12, marginLeft: 2 }} />
      </div>
      {isOpen && (
        <div ref={dropdownRef} className="select-dropdown-panel">
          {options.map(option => (
            <div key={option.code} className="select-dropdown-item truncate" onClick={() => handleSelect(option)}
              style={{
                color: option.colorMain, backgroundColor: selectedOption.code === option.code ? (option.colorSub || lightenColor(option.colorMain, 0.85)) : '#fff',
              }}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OptionSelector;