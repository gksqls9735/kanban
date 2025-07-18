import { useCallback, useEffect, useState } from "react";
import { ViewModes } from "../../../constant/constants";
import useDropdown from "../../../hooks/use-dropdown";
import useViewModeStore from "../../../store/viewmode-store";
import ReactDOM from "react-dom";

import EditIcon from "../../../assets/edit.svg?react";
import TrashIcon from "../../../assets/trash-bold.svg?react";
import ColumnInsertLeft from "../../../assets/column-insert-left.svg?react";
import ColumnInsertRight from "../../../assets/column-insert-right.svg?react";

// 드롭다운 메뉴의 대략적인 크기 (폴백용)
const DROPDOWN_MENU_WIDTH_COL_HEADER_FALLBACK = 180;
const DROPDOWN_MENU_HEIGHT_COL_HEADER_FALLBACK = 108; // (아이템 3개 * 36px/아이템)

const SCREEN_EDGE_PADDING = 10; // 화면 가장자리 여백
const DROPDOWN_HORIZONTAL_GAP = 5; // 트리거와 드롭다운 메뉴 사이의 수평 여백 (오른쪽에 붙을 때)
const DROPDOWN_VERTICAL_GAP = 5; // 트리거와 드롭다운 메뉴 사이의 수직 여백 (아래에 붙을 때)


const ColumnHeader: React.FC<{
  columnId: string;
  columnTitle: string;
  deleteActionLabel: string;
  onDelete: () => void;
  handleEditClick: () => void;
  onAddBefore?: (targetSectionId: string) => void;
  onAddAfter?: (targetSectionId: string) => void;
}> = ({ columnId, columnTitle, deleteActionLabel, onDelete, handleEditClick, onAddBefore, onAddAfter }) => {
  const viewMode = useViewModeStore(state => state.viewMode);
  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown(); // 훅에서 dropdownRef도 반환받음

  const isWatingStatus = columnTitle === '대기';
  const isReadOnly = isWatingStatus || columnTitle === '진행' || columnTitle === '완료';

  // dropdownPosition을 {top:0, left:0}으로 초기화하여 렌더링을 보장하고, '날아오는 느낌'을 최소화합니다.
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // 드롭다운 메뉴 위치 계산 함수 (Portal용: 뷰포트 기준 절대 위치 계산)
  const calcDropdownPosition = useCallback(() => {
    // Ref가 모두 유효할 때만 계산을 시도합니다.
    // useEffect에서 setTimeout을 통해 이 가정이 충족되도록 합니다.
    if (!wrapperRef.current || !dropdownRef.current) {
      // console.warn("ColumnHeader: Ref is null during calcDropdownPosition."); // 디버깅용
      setDropdownPosition({ top: 0, left: 0 }); // 계산 불가 시 기본 위치 유지 (점프 방지)
      return;
    }

    const triggerRect = wrapperRef.current.getBoundingClientRect(); // 트리거의 뷰포트 기준 위치와 크기

    // 실제 렌더링된 드롭다운의 크기를 측정합니다. (폴백 값 사용)
    const actualDropdownHeight = dropdownRef.current.offsetHeight || DROPDOWN_MENU_HEIGHT_COL_HEADER_FALLBACK;
    const actualDropdownWidth = dropdownRef.current.offsetWidth || DROPDOWN_MENU_WIDTH_COL_HEADER_FALLBACK;

    let newLeft: number;
    let newTop: number;

    // 1. newLeft 계산: 드롭다운의 왼쪽 끝을 트리거의 오른쪽 끝에 맞춤 (뷰포트 기준 절대 위치)
    // 이미지에 따르면 드롭다운은 트리거 아이콘의 오른쪽에 붙어 있습니다.
    newLeft = triggerRect.right + window.scrollX + DROPDOWN_HORIZONTAL_GAP;

    // 화면 오른쪽 경계 처리
    if (newLeft + actualDropdownWidth > window.innerWidth + window.scrollX - SCREEN_EDGE_PADDING) {
      // 오른쪽에 공간이 부족하면 트리거의 왼쪽으로 옮깁니다.
      // 드롭다운의 오른쪽 끝을 트리거의 왼쪽 끝에 맞춥니다.
      newLeft = triggerRect.left + window.scrollX - actualDropdownWidth - DROPDOWN_HORIZONTAL_GAP;

      // 왼쪽으로 옮겼을 때, 화면의 왼쪽 경계를 벗어나는지 확인
      if (newLeft < window.scrollX + SCREEN_EDGE_PADDING) {
        newLeft = window.scrollX + SCREEN_EDGE_PADDING; // 화면 왼쪽 경계에 맞춤
      }
    }


    // 2. newTop 계산: 드롭다운의 상단이 트리거와 같은 높이에 오도록 맞춥니다 (뷰포트 기준 절대 위치)
    // ColumnHeader의 드롭다운은 트리거 아이콘의 바로 아래가 아닌, 아이콘의 수평선 상에 나타나는 것이 일반적입니다.
    newTop = triggerRect.top + window.scrollY; // 트리거 아이콘의 상단에 드롭다운 상단을 맞춥니다.
    // 만약 트리거 바로 아래에 붙이고 싶다면: newTop = rect.bottom + window.scrollY + DROPDOWN_VERTICAL_GAP;

    // 아래쪽 경계 처리
    if (newTop + actualDropdownHeight > window.innerHeight + window.scrollY - SCREEN_EDGE_PADDING) {
      // 아래 공간 부족 시 트리거의 위쪽으로 올립니다.
      newTop = triggerRect.top + window.scrollY - actualDropdownHeight - DROPDOWN_VERTICAL_GAP;

      // 위로 올렸을 때, 화면의 위쪽 경계를 벗어나는지 확인
      if (newTop < window.scrollY + SCREEN_EDGE_PADDING) {
        newTop = window.scrollY + SCREEN_EDGE_PADDING; // 화면 위쪽 경계에 맞춤
      }
    }

    setDropdownPosition({ top: newTop, left: newLeft });

  }, [wrapperRef, dropdownRef]); // dropdownRef를 의존성 배열에 추가 (offsetHeight 사용)


  // useEffect (isOpen 상태 변경 감지 및 위치 계산 트리거)
  useEffect(() => {
    if (isOpen) {
      // 0ms setTimeout을 사용하여 DOM에 드롭다운 패널이 렌더링될 시간을 줍니다.
      // 이렇게 해야 dropdownRef.current가 유효해지고 offsetHeight/offsetWidth를 정확히 측정할 수 있습니다.
      const timer = setTimeout(() => {
        // setTimeout 콜백 내부에서 dropdownRef.current가 존재하는지 다시 확인
        if (dropdownRef.current) {
          calcDropdownPosition();
        } else {
          // Ref가 아직 null이면 (첫 렌더링 시), setDropdownPosition을 호출하지 않고,
          // 초기값 ({top:0, left:0})을 유지하여 렌더링되도록 합니다.
          // 다음 렌더링 사이클에서 Ref가 유효해지면 다시 계산될 것입니다.
          console.warn("ColumnHeader: dropdownRef.current is null after setTimeout(0). Waiting for next render tick.");
        }
      }, 0);

      window.addEventListener('resize', calcDropdownPosition);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', calcDropdownPosition);
      };
    } else {
      setDropdownPosition({ top: 0, left: 0 }); // 드롭다운 닫힐 때 위치를 리셋 (다음 열릴 때 0,0에서 시작)
    }
  }, [isOpen, calcDropdownPosition, dropdownRef.current]); // dropdownRef.current를 의존성 배열에 추가


  const handleAddBefore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddBefore) return;
    onAddBefore(columnId);
    setIsOpen(false); // 드롭다운 메뉴 닫기
  };

  const handleAddAfter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddAfter) return;
    onAddAfter(columnId);
    setIsOpen(false); // 드롭다운 메뉴 닫기
  };

  const handleDelete = (e: React.MouseEvent) => { // onDelete prop을 직접 사용하지 않고 핸들러 추가
    e.stopPropagation();
    onDelete(); // 부모에서 전달받은 onDelete 호출
    setIsOpen(false); // 드롭다운 메뉴 닫기
  };

  // Portal로 렌더링될 드롭다운 메뉴
  const renderDropdownMenu = () => {
    // isOpen이 true이고 dropdownPosition이 유효해야 렌더링 (단, 초기 0,0은 유효로 간주)
    if (!isOpen || !dropdownPosition) return null;

    return ReactDOM.createPortal(
      <>
        <style>{style}</style>
        <div
          ref={dropdownRef}
          className="section-header__dropdown-menu" // 기존 CSS 클래스 유지
          style={{
            position: 'absolute', // body 기준 absolute
            width: `${DROPDOWN_MENU_WIDTH_COL_HEADER_FALLBACK}px`, // Fallback 너비 사용
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 1000 // 다른 요소 위에 확실히 오도록 높은 z-index
          }}
        >
          {!isWatingStatus && (
            <div className="section-header-dropdown-item" onClick={handleAddBefore}>
              <ColumnInsertLeft width="16" height="16" />
              {`왼쪽에 ${viewMode === ViewModes.STATUS ? '상태' : '섹션'}추가`}
            </div>
          )}
          <div className="section-header-dropdown-item" onClick={handleAddAfter}>
            <ColumnInsertRight width="16" height="16" />
            {`오른쪽에 ${viewMode === ViewModes.STATUS ? '상태' : '섹션'}추가`}
          </div>
          {!isReadOnly && (
            <div className="section-header-dropdown-item" onClick={handleDelete}> {/* onDelete 대신 handleDelete 호출 */}
              <TrashIcon width="16" height="16" />
              {deleteActionLabel}
            </div>
          )}
        </div>
      </>, document.body
    );
  };

  return (
    <>
      <span className="section-header__title">{columnTitle}</span>
      <>
        <div className="section-header__actions">
          {!isReadOnly && (
            <div className="section-header__action" onClick={handleEditClick}>
              <EditIcon width="14" height="14" />
            </div>
          )}
          <div ref={wrapperRef} className="section-header__action" onClick={toggle}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#8D99A8" style={{ padding: 5 }}>
              <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
            </svg>
          </div>
        </div>
        {renderDropdownMenu()} {/* Portal 렌더링 함수 호출 */}
      </>
    </>
  );
};

export default ColumnHeader;

const style = `
/* 헤더 드롭다운 메뉴 */
.section-header__dropdown-menu  {
  position: absolute;
  border: 1px solid #E4E8EE;
  padding: 8px 0px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 400;
  color: #0F1B2A;
  background-color: white;
  box-shadow: 0px 0px 16px 0px #00000014;
  z-index: 10;
  width: 180px;
}

.section-header-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0px 12px;
  height: 36px;
  cursor: pointer
}

.section-header-dropdown-item:hover {
  background-color: rgb(241, 241, 241);
}

`;