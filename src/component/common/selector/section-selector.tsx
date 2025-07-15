import { Section } from "../../../types/type";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import useDropdown from "../../../hooks/use-dropdown";
import { truncateText } from "../../../utils/text-function";
import useSectionsStore from "../../../store/sections-store";
import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";

const SECTION_SELECTOR_WIDTH = 120;
const SECTION_SELECTOR_ITEM_HEIGHT = 36;
const SCREEN_EDGE_PADDING = 10;

const SectionSelector: React.FC<{
  selectedSection: Section;
  onSectionSelect: (section: Section) => void;
  isOwnerOrParticipant?: boolean;
  onToggle?: (isOpen: boolean) => void;
}> = ({ selectedSection, onSectionSelect, isOwnerOrParticipant = false, onToggle }) => {
  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const sections = useSectionsStore(state => state.sections);

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

      if (newLeft + SECTION_SELECTOR_WIDTH + SCREEN_EDGE_PADDING > window.innerWidth + window.scrollX) {
        newLeft = rect.left + window.scrollX - SECTION_SELECTOR_WIDTH;
        if (newLeft < window.scrollX + SCREEN_EDGE_PADDING) newLeft = window.scrollX + SCREEN_EDGE_PADDING;
      }

      const actualDropdownHeight = SECTION_SELECTOR_ITEM_HEIGHT * sections.length;

      if (newTop + actualDropdownHeight + SCREEN_EDGE_PADDING > window.innerHeight + window.scrollY) {
        newTop = rect.top + window.scrollY - actualDropdownHeight;
        if (newTop < window.scrollY + SCREEN_EDGE_PADDING) newTop = window.scrollY + SCREEN_EDGE_PADDING;
      }
      setDropdownPosition({ top: newTop, left: newLeft });
    }
  }, [wrapperRef, sections.length]);

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


  const handleSectionSelect = (e: React.MouseEvent, section: Section) => {
    e.stopPropagation();
    onSectionSelect(section);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {isOwnerOrParticipant ? (
        <>
          <div ref={wrapperRef} className="card-current-section update-card-current-section" onClick={toggle} style={{ cursor: 'pointer' }}>
            {truncateText(selectedSection.sectionName, 10)}
            <FontAwesomeIcon icon={faCaretDown} style={{ width: 12, height: 12 }} />
          </div>
          {isOpen && dropdownPosition && (
            ReactDOM.createPortal(
              <>
                <style>{style}</style>
                <div ref={dropdownRef} className="select-dropdown-panel section-dropdown-panel" style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}>
                  {sections.map(sec => (
                    <div key={sec.sectionId} className="select-dropdown-item section-dropdown-item truncate" onClick={(e) => handleSectionSelect(e, sec)}>
                      {sec.sectionName}
                    </div>
                  ))}
                </div>
              </>, document.body
            )
          )}
        </>
      ) : (
        <div className="card-current-section">{truncateText(selectedSection.sectionName, 10)}</div>
      )}

    </div>
  );
};

export default SectionSelector;


const style = `
.select-dropdown-panel {
  position: absolute;
  padding: 8px 0px !important;
  display: flex;
  flex-direction: column;
  border: 1px solid #E4E8EE;
  border-radius: 4px;
  box-shadow: 0px 0px 16px 0px #00000014;
  background-color: #fff;
  z-index: 1001;
  box-sizing: border-box;
}

.section-dropdown-panel {
  width: 120px;
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