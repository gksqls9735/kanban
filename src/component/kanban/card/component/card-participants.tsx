import { useCallback, useEffect, useMemo, useState } from "react";
import useDropdown from "../../../../hooks/use-dropdown";
import { Participant } from "../../../../types/type";
import { extractLastTeamName, getInitial } from "../../../../utils/text-function";
import AvatarGroup from "../../../common/avatar/avatar-group";
import AvatarItem from "../../../common/avatar/avatar";
import UserProfile from "../../../common/profile/user-profile";
import ReactDOM from "react-dom";

const CardParticipants: React.FC<{
  taskParticipants: Participant[];
  onModalStateChange: (isOpen: boolean) => void;
}> = ({ taskParticipants, onModalStateChange }) => {
  const [openProfile, setOpenProfile] = useState<Participant | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);

  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();

  useEffect(() => {
    onModalStateChange(isOpen || !!openProfile);
  }, [isOpen, openProfile, onModalStateChange]);

  const handleClosePopover = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setPopoverPosition(null);
  }, [setIsOpen])

  const sortedParticipants = useMemo(() => {
    if (!taskParticipants || taskParticipants.length === 0) return [];

    return [...taskParticipants].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return 0;
    });
  }, [taskParticipants]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const popoverWidth = 256;
      const popoverHeight = 306;

      let newLeft = rect.right + window.scrollX + 8;
      let newTop = rect.top + window.scrollY;

      if (newLeft + popoverWidth > window.innerWidth + window.scrollX) {
        newLeft = rect.left + window.scrollX - popoverWidth - 8;
        if (newLeft < window.scrollX + 8) newLeft = window.scrollX + 8;
      }

      if (newTop + popoverHeight > window.innerHeight + window.scrollY) {
        newTop = window.innerHeight + window.scrollY - popoverHeight - 8;
        if (newTop < window.scrollY + 8) newTop = window.scrollY + 8;
      }
      setPopoverPosition({ top: newTop, left: newLeft });
    }
    toggle();
  }, [toggle, wrapperRef]);

  const handleOpenProfile = useCallback((e: React.MouseEvent, user: Participant) => {
    e.stopPropagation();
    setOpenProfile(user);
  }, []);

  const renderPopover = () => {
    if (!isOpen || !popoverPosition) return null;

    return ReactDOM.createPortal(
      <>
        <style>{style}</style>
        <div className="participant-popover" ref={dropdownRef} style={{ top: popoverPosition.top, left: popoverPosition.left }}>
          <div className="participant-popover__header">
            <span className="participant-popover__title">담당자</span>
            <svg onClick={handleClosePopover} xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="#5F6B7A" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x" id="X--Streamline-Feather" height="16" width="16">
              <desc>X Streamline Icon: https://streamlinehq.com</desc>
              <path d="M11.25 3.75 3.75 11.25" strokeWidth="1"></path>
              <path d="m3.75 3.75 7.5 7.5" strokeWidth="1"></path>
            </svg>
          </div>
          <div className="participant-popover__list kanban-scrollbar-y">
            {sortedParticipants.length > 0 && (
              sortedParticipants.map((user) => (
                <div key={user.id} className="participant-popover__item" onClick={(e) => handleOpenProfile(e, user)}>
                  <AvatarItem
                    key={user.id}
                    size={32}
                    src={user.icon}
                  >
                    {getInitial(user.username)}
                  </AvatarItem>
                  <div className={`participant-popover__info ${user.isMain ? 'participant-popover__info--main' : ''}`}>
                    <div className="participant-popover__name-line">
                      <div className="participant-popover__username">{user.username}</div>
                      {user.isMain && (<div className="participant-main-badge">주</div>)}
                    </div>
                    <span className="participant-popover__team">{extractLastTeamName(user.team)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </>, document.body
    );
  };

  return (
    <div ref={wrapperRef} className="card-participant" onClick={e => e.stopPropagation()}>
      <div onClick={handleToggle}>
        <AvatarGroup list={sortedParticipants} maxVisible={3} />
      </div>
      {renderPopover()}
      {openProfile && (<UserProfile user={openProfile} onClose={() => setOpenProfile(null)} />)}
    </div>
  );
};

export default CardParticipants;


const style = `
.participant-popover {
  display: flex;
  flex-direction: column;
  overflow: hidden;

  position: absolute;
  width: 256px;
  height: 306px;
  border: 1px solid #E4E8EE;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0px 4px 12px -2px #10182814;
  z-index: 10;
}

.participant-popover__header {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #EEF1F6;
  flex-shrink: 0;
}

.participant-popover__title {
  font-size: 15px;
  font-weight: 600;
  line-height: 100%;
  letter-spacing: 0%;
}

.participant-popover__list {
  padding: 8px 0px;
  overflow-y: auto;
  flex-grow: 1;
}

.participant-popover__item {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  align-items: center;
  cursor: pointer;
}

.participant-popover__item:hover {
  background-color: #EEF1F6;
}

.participant-popover__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.participant-popover__info--main {
  gap: 2px
}


.participant-popover__name-line {
  display: flex;
  gap: 4px;
  align-items: baseline;
}

.participant-popover__username {
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0%;
  color: #0F1B2A;
}

.participant-popover__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #0F1B2A;
  color: white;
  box-sizing: border-box;
  font-size: 11px;
  line-height: 1;
  flex-shrink: 0;
}

.participant-popover__team {
  font-size: 12px;
  font-weight: 400;
  line-height: 100%;
  letter-spacing: 0%;
  color: #8D99A8;
}

.kanban-scrollbar-y {
  &::-webkit-scrollbar {
    width: 5px;
    height: 0px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  &::-webkit-scrollbar-track {
    border-radius: 10px;
  }

  &::-webkit-scrollbar-button {
    display: none;
  }
}


.participant-main-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #0F1B2A;
  color: white;
  box-sizing: border-box;
  font-size: 11px;
  line-height: 1;
  flex-shrink: 0;
}
`