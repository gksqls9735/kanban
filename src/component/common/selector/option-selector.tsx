import { SelectOption } from "../../../types/type";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { lightenColor } from "../../../utils/color-function";
import useDropdown from "../../../hooks/use-dropdown";
import { truncateText } from "../../../utils/text-function";
import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";

const OPTION_SELECTOR_WIDTH = 80;
const OPTION_SELECTOR_ITEM_HEIGHT = 36;
const SCREEN_EDGE_PADDING = 10;

const OptionSelector: React.FC<{
  options: SelectOption[];
  selectedOption: SelectOption;
  onSelect: (option: SelectOption) => void;
  isOwnerOrParticipant?: boolean;
  onToggle?: (isOpen: boolean) => void;
}> = ({ options, selectedOption, onSelect, isOwnerOrParticipant = false, onToggle }) => {
  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (onToggle) onToggle(isOpen);
  }, [isOpen, onToggle]);

  const calcDropdownPosition = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      let newLeft: number;
      let newTop: number;

      newLeft = rect.right + window.scrollX;
      newTop = rect.bottom + window.scrollY;

      if (newLeft + OPTION_SELECTOR_WIDTH + SCREEN_EDGE_PADDING > window.innerWidth + window.scrollX) {
        newLeft = rect.left + window.scrollX - OPTION_SELECTOR_WIDTH;
        if (newLeft < window.scrollX + SCREEN_EDGE_PADDING) newLeft = window.scrollX + SCREEN_EDGE_PADDING;
      }

      const actualDropdownHeight = OPTION_SELECTOR_ITEM_HEIGHT * options.length;

      if (newTop + actualDropdownHeight + SCREEN_EDGE_PADDING > window.innerHeight + window.scrollY) {
        newTop = rect.top + window.scrollY - actualDropdownHeight;
        if (newTop < window.scrollY + SCREEN_EDGE_PADDING) newTop = window.scrollY + SCREEN_EDGE_PADDING;
      }
      setDropdownPosition({ top: newTop, left: newLeft });
    }
  }, [wrapperRef, options.length]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        calcDropdownPosition();
      }, 0);

      window.addEventListener('resize', calcDropdownPosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', calcDropdownPosition);
      };
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen, calcDropdownPosition]);

  const handleOptionSelect = (e: React.MouseEvent, option: SelectOption) => {
    e.stopPropagation();
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="card-select-wrapper">
      {isOwnerOrParticipant ? (
        <>
          <div ref={wrapperRef} className="card-priority-status-current " onClick={toggle}
            style={{ color: selectedOption.colorMain, backgroundColor: selectedOption.colorSub || lightenColor(selectedOption.colorMain, 0.85), cursor: 'pointer' }}
          >
            {truncateText(selectedOption.name, 2)}
            <FontAwesomeIcon icon={faCaretDown} style={{ width: 12, height: 12, marginLeft: 2 }} />
          </div>
          {isOpen && dropdownPosition && (
            ReactDOM.createPortal(
              <>
                <style>{style}</style>
                <div ref={dropdownRef} className="select-dropdown-panel" style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}>
                  {options.map(option => (
                    <div key={option.code} className="select-dropdown-item truncate" onClick={(e) => handleOptionSelect(e, option)}
                      style={{
                        color: option.colorMain, backgroundColor: selectedOption.code === option.code ? (option.colorSub || lightenColor(option.colorMain, 0.85)) : undefined,
                      }}
                    >
                      {option.name}
                    </div>
                  ))}
                </div>
              </>, document.body
            )
          )}
        </>
      ) : (
        <>
          <div className="card-priority-status">
            <div className="card-priority-status-current truncate"
              style={{ color: selectedOption.colorMain, backgroundColor: selectedOption.colorSub || lightenColor(selectedOption.colorMain, 0.85) }}
            >
              {truncateText(selectedOption.name, 2)}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default OptionSelector;

const style = `

/* 새로운 작업 카드 */
/* 드롭 다운 섹션, 우선 순위, 상태 */
.select-dropdown-panel {
  position: absolute;
  top: calc(100% + 2px);
  padding: 8px 0px !important;
  display: flex;
  flex-direction: column;
  border: 1px solid #E4E8EE;
  border-radius: 4px;
  box-shadow: 0px 0px 16px 0px #00000014;
  background-color: #fff;
  z-index: 1001;
  box-sizing: border-box;
  width: 80px;
}

.select-dropdown-item {
  font-size: 13px;
  height: 36px;
  line-height: 36px;
  padding: 0px 12px !important;
  color: '#0F1B2A';
  cursor: pointer;
}

.select-dropdown-item:hover {
  background-color: #ececec;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
`