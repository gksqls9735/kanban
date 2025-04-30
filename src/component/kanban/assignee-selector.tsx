import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { userlist } from "../../mocks/user-mock";
import { Participant } from "../../types/type";
import { getInitial } from "../../utils/text-function";
import AvatarItem from "../avatar/avatar";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

const AssigneeSelector: React.FC<{
  participants: Participant[];  // 또는 user로 받기
  onClose: () => void;
}> = ({ participants, onClose }) => {
  const [isHoveredPrimary, setIsHoveredPrimary] = useState(false);
  const [isHoveredSecondary, setIsHoveredSecondary] = useState(false);

  const [openDropdownId, setOpenDropdownId] = useState<string | number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRefs = useRef<{ [key: string | number]: HTMLDivElement | null }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDropdownToggle = useCallback((id: string | number) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      setDropdownPosition(null);
    } else {
      const triggerElement = triggerRefs.current[id];
      if (triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 2,
          left: rect.left + window.scrollX,
        });
        setOpenDropdownId(id);
      }
    }
  }, [openDropdownId]);

  const handleCloseDropdown = useCallback(() => {
    setOpenDropdownId(null);
    setDropdownPosition(null);
  }, []);

  const handleSetRole = (participantId: string | number, isMain: boolean) => {
    handleCloseDropdown();
  };

  useLayoutEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedElement = e.target as Node;
      const triggerElement = openDropdownId ? triggerRefs.current[openDropdownId] : null;

      if (
        triggerElement && !triggerElement.contains(clickedElement) &&
        dropdownRef.current && !dropdownRef.current.contains(clickedElement)
      ) {
        handleCloseDropdown();
      }
    };

    if (openDropdownId != null) document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside) };
  }, [openDropdownId, handleCloseDropdown]);

  const portalElement = typeof window !== 'undefined' ? document.getElementById('portal-root') : null;
  const isUserSelected = (uId: string) => participants.some(u => u.id === uId)
  return (
    <div className="assignee-modal__overlay">
      <div className="assignee-modal__container" onClick={e => e.stopPropagation()}>
        <div className="assignee-modal__header">
          <div className="assignee-modal__title">담당자 지정</div>
          <div className="assignee-modal__close-button-container" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="#414D5C" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x" id="X--Streamline-Feather" height="16" width="16">
              <desc>X Streamline Icon: https://streamlinehq.com</desc>
              <path d="M11.25 3.75 3.75 11.25" strokeWidth="1"></path>
              <path d="m3.75 3.75 7.5 7.5" strokeWidth="1"></path>
            </svg>
          </div>
        </div>
        <div className="assignee-modal__body">
          <div className="assignee-modal__tabs">
            <div className="assignee-modal__tab assignee-modal__tab--active"><span className="assignee-modal__tab-text">사용자</span></div>
            <div className="assignee-modal__tab"><span className="assignee-modal__tab-text">조직도</span></div>
          </div>
          <div className="assignee-modal__panels">
            <div className="assignee-modal__user-list-panel">
              <div className="assignee-modal__search-container">
                <div className="assignee-modal__search-bar">
                  <input
                    className="assignee-modal__search-input"
                    placeholder="이름, 직위로 찾기"
                    type="text"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" id="Search--Streamline-Lucide" height="16" width="16">
                    <desc>Search Streamline Icon: https://streamlinehq.com</desc>
                    <path d="M1.875 6.875a5 5 0 1 0 10 0 5 5 0 1 0 -10 0" strokeWidth="1"></path><path d="m13.125 13.125 -2.6875 -2.6875" strokeWidth="1"></path>
                  </svg>
                </div>
              </div>
              <div className="assignee-modal__user-list kanban-scrollbar-y">
                <div className="assignee-modal__select-all-row">
                  <div>모두 선택</div>
                  <div className="assignee-modal__checkbox-area">
                    <input
                      type="checkbox"
                      checked={false}
                      className="assignee-modal__checkbox--native"
                      id={`all-user-check`}
                      onChange={() => { }}
                    />
                    <label onClick={() => { }} htmlFor={`all-user-check`} className="assignee-modal__checkbox--visual"></label>
                  </div>
                </div>
                {userlist.map(user => (
                  <div className="assignee-modal__user-item" key={user.id}
                  style={{ backgroundColor: `${isUserSelected(user.id) ? '#D1FADF' : ''}`}}
                  >
                    <div className="assignee-modal__user-item-info">
                      <AvatarItem
                        key={user.id}
                        size={40}
                      >
                        {getInitial(user.username)}
                      </AvatarItem>
                      <div className="assignee-modal__user-item-text">
                        <div className="assignee-modal__user-item-name-line">
                          <span className="assignee-modal__user-item-username">{user.username}</span>
                          <span className="assignee-modal__user-item-team">{user.team}</span>
                        </div>
                        <span className="assignee-modal__user-item-description">사용자 지정 설명</span>
                      </div>
                    </div>
                    <div className="assignee-modal__checkbox-area">
                      <input
                        type="checkbox"
                        checked={isUserSelected(user.id)}
                        className="assignee-modal__checkbox--native"
                        id={`all-user-check`}
                        onChange={() => { }}
                      />
                      <label onClick={() => { }} htmlFor={`all-user-check`} className="assignee-modal__checkbox--visual" style={{ borderRadius: 3, margin: 0 }}></label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="assignee-modal__selected-panel">
              <div className="assignee-modal__selected-header">
                <span className="assignee-modal__selected-count">회원 n명 선택</span>
                <span className="assignee-modal__remove-all">모두 삭제</span>
              </div>
              <div className="assignee-modal__selected-list kanban-scrollbar-y" style={{
                display: 'flex', flexDirection: 'column',
                flexGrow: 1,
                overflowY: 'auto',
                minHeight: 0, paddingRight: 7
              }}>
                {participants.map(p => (
                  <div key={p.id} className="assignee-modal__selected-item"
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56,
                      boxSizing: 'border-box', flexShrink: 0
                    }}>
                    <div className="assignee-modal__selected-item-info" style={{ display: 'flex', gap: 12 }}>
                      <AvatarItem
                        key={p.id}
                        size={40}
                      >
                        {getInitial(p.username)}
                      </AvatarItem>
                      <div className="assignee-modal__selected-item-text">
                        <span className="assignee-modal__selected-item-username" >{p.username}</span>
                        <span className="assignee-modal__selected-item-team" >{p.team}</span>
                      </div>
                    </div>
                    <div className="assignee-modal__selected-item-actions" >
                      <div className="assignee-modal__role-selector"
                        onClick={e => { e.stopPropagation(); handleDropdownToggle(p.id) }}
                        ref={(el: HTMLDivElement | null) => { triggerRefs.current[p.id] = el }}
                      >
                        <span className="assignee-modal__role-text">{p.isMain ? '주담당자' : '담당자'}</span>
                        <FontAwesomeIcon icon={faCaretDown} className="assignee-modal__role-icon" />
                      </div>
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="#7D8998" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x" id="X--Streamline-Feather" height="16" width="16">
                          <desc>X Streamline Icon: https://streamlinehq.com</desc>
                          <path d="M11.25 3.75 3.75 11.25" strokeWidth="1"></path>
                          <path d="m3.75 3.75 7.5 7.5" strokeWidth="1"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="assignee-modal__footer">
          <button className="assignee-modal__button assignee-modal__button--cancel">취소</button>
          <button className="assignee-modal__button assignee-modal__button--confirm">추가하기</button>
        </div>

        {openDropdownId !== null && dropdownPosition && portalElement && (
          ReactDOM.createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                border: '1px solid #E4E8EE',
                borderRadius: 4,
                padding: '8px 0px',
                fontSize: 13,
                fontWeight: 400,
                color: '#0F1B2A',
                backgroundColor: 'white',
                boxShadow: '0px 0px 16px 0px #00000014',
                zIndex: 1110,
                width: 120,
              }}
              onClick={e => e.stopPropagation()}
            >
              <div onMouseEnter={() => setIsHoveredPrimary(true)} onMouseLeave={() => setIsHoveredPrimary(false)} onClick={() => handleSetRole(openDropdownId, true)}
                style={{
                  cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0px 12px', height: 36, backgroundColor: `${isHoveredPrimary ? 'rgb(241, 241, 241)' : ''}`
                }}>주담당자</div>
              <div onMouseEnter={() => setIsHoveredSecondary(true)} onMouseLeave={() => setIsHoveredSecondary(false)} onClick={() => handleSetRole(openDropdownId, false)}
                style={{
                  cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0px 12px', height: 36, backgroundColor: `${isHoveredSecondary ? 'rgb(241, 241, 241)' : ''}`
                }}>담당자</div>
            </div>, portalElement
          )
        )}
      </div>
    </div>
  );
};

export default AssigneeSelector;