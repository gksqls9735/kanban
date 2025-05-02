import { Participant, User } from "../../types/type";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import RoleDropdown from "./role-dropdown";
import SelectedUsersPanel from "./right-panel/selectedusers-panel";
import UserListPanel from "./left-panel/userlist-panel";
import useUserStore from "../../store/user-store";

const ParticipantSelector: React.FC<{
  initialParticipants: Participant[];
  onClose: () => void;
  onConfirm: (participant: Participant[]) => void;
}> = ({ initialParticipants, onClose, onConfirm }) => {
  const userlist = useUserStore(state => state.userlist);

  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);

  const [openDropdownId, setOpenDropdownId] = useState<string | number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  const [isOrgChartView, setIsOrgChartView] = useState<boolean>(false);

  const triggerRefs = useRef<{ [key: string | number]: HTMLDivElement | null }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // SelectedUserPanel에 전달할 ref 설정 함수
  const handleSetTriggerRef = useCallback((id: string | number, el: HTMLDivElement | null) => {
    triggerRefs.current[id] = el;
  }, []);

  // 선택된 사용자 ID Set
  const selectedParticipantIds = useMemo(() => {
    return new Set(participants.map(p => p.id));
  }, [participants]);

  // 핸들러 함수
  const handleCloseDropdown = useCallback(() => {
    setOpenDropdownId(null);
    setDropdownPosition(null);
  }, []);

  const handleDropdownToggle = useCallback((id: string | number) => {
    if (openDropdownId === id) {
      handleCloseDropdown();
    } else {
      const triggerElement = triggerRefs.current[id];
      if (triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 2,
          left: rect.left + window.scrollX,
        });
        setOpenDropdownId(id);
      } else {
        console.warn(`Trigger element for id ${id} not found in refs.`);
        handleCloseDropdown();
      }
    }
  }, [openDropdownId, handleCloseDropdown]);

  const handleSetRole = (isMain: boolean) => {
    setParticipants(prev =>
      prev.map(p => (p.id === openDropdownId ? { ...p, isMain } : { ...p, isMain: false }))
    );
    handleCloseDropdown();
  };

  // 사용자 선택/해제
  const handleSelectUser = useCallback((userId: string | number, select: boolean) => {
    setParticipants(prev => {
      if (select) {
        const userToAdd = userlist.find(u => u.id === userId);
        if (userToAdd && !prev.some(p => p.id === userId)) return [...prev, { ...userToAdd, isMain: false }];
      } else {
        return prev.filter(p => p.id !== userId);
      }
      return prev;
    })
  }, [userlist]);

  const handleSelectAllUsers = useCallback((select: boolean, filteredUsers: User[]) => {
    if (select) {
      const newParticipants = filteredUsers
        .filter(u => !participants.some(p => p.id === u.id))
        .map(u => ({ ...u, isMain: false }));
      setParticipants(prev => [...prev, ...newParticipants]);
    } else {
      setParticipants([]);
    }
  }, [userlist, participants]);

  const handleRemoveParticipant = useCallback((id: string | number) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    if (triggerRefs.current[id]) delete triggerRefs.current[id];
    if (openDropdownId === id) handleCloseDropdown();
  }, [openDropdownId, handleCloseDropdown]);

  const handleRemoveAllParticipants = useCallback(() => {
    setParticipants([]);
    triggerRefs.current = {};
    handleCloseDropdown();
  }, [handleCloseDropdown]);

  const handleConfirm = () => {
    onConfirm(participants);
    onClose();
  };

  useLayoutEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedElement = e.target as Node;
      const triggerElement = openDropdownId ? triggerRefs.current[openDropdownId] : null;

      if (
        dropdownRef.current && !dropdownRef.current.contains(clickedElement) &&
        triggerElement && !triggerElement.contains(clickedElement)
      ) {
        handleCloseDropdown();
      } else if (dropdownRef.current && !dropdownRef.current.contains(clickedElement) && !triggerElement) {
        handleCloseDropdown();
      }
    };

    if (openDropdownId != null) document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside) };
  }, [openDropdownId, handleCloseDropdown]);

  const portalElement = typeof window !== 'undefined' ? document.getElementById('portal-root') : null;

  return (
    <div className="participant-modal__overlay" onClick={onClose}>
      <div className="participant-modal__container" onClick={e => e.stopPropagation()}>
        <div className="participant-modal__header">
          <div className="participant-modal__title">담당자 지정</div>
          <div className="participant-modal__close-button-container" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="#414D5C" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x" id="X--Streamline-Feather" height="16" width="16">
              <desc>X Streamline Icon: https://streamlinehq.com</desc>
              <path d="M11.25 3.75 3.75 11.25" strokeWidth="1"></path>
              <path d="m3.75 3.75 7.5 7.5" strokeWidth="1"></path>
            </svg>
          </div>
        </div>
        <div className="participant-modal__body">
          <div className="participant-modal__tabs">
            <div className={`participant-modal__tab ${!isOrgChartView ? 'participant-modal__tab--active' : ''}`}
              onClick={() => setIsOrgChartView(false)}
            >
              <span className="participant-modal__tab-text">사용자</span>
            </div>
            <div className={`participant-modal__tab ${isOrgChartView ? 'participant-modal__tab--active' : ''}`}
              onClick={() => setIsOrgChartView(true)}
            >
              <span className="participant-modal__tab-text">조직도</span>
            </div>
          </div>
          <div className="participant-modal__panels">
            {!isOrgChartView ? (
              <UserListPanel
                users={userlist}
                selectedParticipantIds={selectedParticipantIds}
                onSelectUser={handleSelectUser}
                onSelectAll={handleSelectAllUsers}
              />
            ) : (
              <>
                <div className="participant-modal__user-list-panel">
                  조직도
                </div>
              </>
            )}
            <SelectedUsersPanel
              participants={participants}
              onRemoveParticipant={handleRemoveParticipant}
              onRemoveAll={handleRemoveAllParticipants}
              onToggleDropdown={handleDropdownToggle}
              setTriggerRef={handleSetTriggerRef}
            />
          </div>
        </div>
        <div className="participant-modal__footer">
          <button className="participant-modal__button participant-modal__button--cancel" onClick={onClose}>취소</button>
          <button className="participant-modal__button participant-modal__button--confirm" onClick={handleConfirm}>추가하기</button>
        </div>

        {openDropdownId !== null && dropdownPosition && portalElement && (
          ReactDOM.createPortal(
            <RoleDropdown
              ref={dropdownRef}
              position={dropdownPosition}
              onClick={handleSetRole}
            />, portalElement
          )
        )}
      </div>
    </div>
  );
};

export default ParticipantSelector;