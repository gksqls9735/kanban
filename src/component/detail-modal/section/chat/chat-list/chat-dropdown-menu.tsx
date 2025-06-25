import { useCallback, useEffect, useState } from "react";
import useDropdown from "../../../../../hooks/use-dropdown";
import ReactDOM from "react-dom";

const DROPDOWN_MENU_WIDTH = 100;
const DROPDOWN_VERTICAL_GAP = 5;

const FIXED_BOTTOM_AREA_HEIGHT = 80;
const SCREEN_EDGE_PADDING = 10;

const DROPDOWN_MENU_HEIGHT_FALLBACK = 90;

const ChatDropdownMenu: React.FC<{
  onEdit: () => void
  onDelete: () => void;
}> = ({ onEdit, onDelete }) => {
  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  const calcDropdownPosition = useCallback(() => {
    if (!wrapperRef.current) {
      setDropdownPosition(null);
      return;
    }

    const triggerRect = wrapperRef.current.getBoundingClientRect();
    let newLeft: number;
    let newTop: number;

    const actualDropdownHeight = dropdownRef.current?.offsetHeight || DROPDOWN_MENU_HEIGHT_FALLBACK;

    newLeft = triggerRect.left + window.scrollX + triggerRect.width - DROPDOWN_MENU_WIDTH;

    if (newLeft + DROPDOWN_MENU_WIDTH + SCREEN_EDGE_PADDING > window.innerWidth + window.scrollX) {
      newLeft = window.innerWidth + window.scrollX - DROPDOWN_MENU_WIDTH - SCREEN_EDGE_PADDING;
      if (newLeft < window.scrollX + SCREEN_EDGE_PADDING) newLeft = window.scrollX + SCREEN_EDGE_PADDING;
    }

    if (newLeft < window.scrollX + SCREEN_EDGE_PADDING) newLeft = window.scrollX + SCREEN_EDGE_PADDING;

    let topCandidateBelowTriggerAbsolute = triggerRect.bottom + window.scrollY + DROPDOWN_VERTICAL_GAP;
    let topCandidateAboveTriggerAbsolute = triggerRect.top + window.scrollY - actualDropdownHeight - SCREEN_EDGE_PADDING;

    let finalAbsoluteTop: number;
    const usableViewportBottomLine = window.innerHeight + window.scrollY - FIXED_BOTTOM_AREA_HEIGHT;

    if (topCandidateBelowTriggerAbsolute + actualDropdownHeight <= usableViewportBottomLine) {
      finalAbsoluteTop = topCandidateBelowTriggerAbsolute;
    } else if (topCandidateAboveTriggerAbsolute >= window.scrollY + SCREEN_EDGE_PADDING) {
      finalAbsoluteTop = topCandidateAboveTriggerAbsolute;
    } else {
      finalAbsoluteTop = usableViewportBottomLine - actualDropdownHeight;
      if (finalAbsoluteTop < window.scrollY + SCREEN_EDGE_PADDING) finalAbsoluteTop = window.scrollY + SCREEN_EDGE_PADDING;
    }
    newTop = finalAbsoluteTop;
    setDropdownPosition({ top: newTop, left: newLeft });
  }, [wrapperRef]);

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

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
    setIsOpen(false);
  }, [onEdit, setIsOpen]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setIsOpen(false);
  }, [onDelete, setIsOpen]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  }, [toggle]);

  return (
    <div>
      <div ref={wrapperRef} onClick={handleToggle} style={{ cursor: 'pointer' }}>
        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#414D5C">
          <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
        </svg>
      </div>
      {isOpen && dropdownPosition && (
        ReactDOM.createPortal(
          <>
            <style>{style}</style>
            <div ref={dropdownRef}
              className="select-dropdown-panel"
              style={{
                position: 'absolute',
                width: `${DROPDOWN_MENU_WIDTH}px`,
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                zIndex: 1000
              }}>
              <div className="select-dropdown-item comment-dropdown-item" onClick={handleEditClick}>댓글 수정</div>
              <div className="select-dropdown-item comment-dropdown-item" onClick={handleDeleteClick}>댓글 삭제</div>
            </div>
          </>, document.body
        )
      )}
    </div>
  );
};

export default ChatDropdownMenu;

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
  z-index: 10; /* Portal의 zIndex가 1000이므로 이 z-index는 중요치 않음 */
  box-sizing: border-box;
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

.comment-dropdown-item:hover {
  background-color: #ECFDF3;
}
`;