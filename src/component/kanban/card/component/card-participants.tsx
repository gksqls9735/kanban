import { useMemo } from "react";
import useDropdown from "../../../../hooks/use-dropdown";
import { Participant } from "../../../../types/type";
import { getInitial } from "../../../../utils/text-function";
import AvatarItem from "../../../avatar/avatar";
import AvatarGroup from "../../../avatar/avatar-group";

const CardParticipants: React.FC<{
  taskParticipants: Participant[];
}> = ({ taskParticipants }) => {
  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();

  const handleClosePopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const sortedParticipants = useMemo(() => {
    if (!taskParticipants || taskParticipants.length === 0) return [];

    return [...taskParticipants].sort((a,b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return 0;
    });
  }, [taskParticipants]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  };
  
  return (
    <div ref={wrapperRef} className="card-participant">
      <div onClick={handleToggle}>
        <AvatarGroup list={sortedParticipants} maxVisible={3} />
      </div>
      {isOpen && (
        <div className="participant-popover" ref={dropdownRef}>
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
                <div key={user.id} className="participant-popover__item">
                  <AvatarItem
                    key={user.id}
                    size={32}
                  >
                    {getInitial(user.username)}
                  </AvatarItem>
                  <div className="participant-popover__info">
                    <div className="participant-popover__name-line">
                      <div className="participant-popover__username">{user.username}</div>
                      {user.isMain && (<div className="participant-main-badge">주</div>)}
                    </div>
                    <span className="participant-popover__team">{user.team}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// const areParticipantsPropsEqual = (prevProps: any, nextProps: any) => {
//   const prevParticipants = prevProps.taskParticipants || [];
//   const nextParticipants = nextProps.taskParticipants || [];

//   if (prevParticipants.length !== nextParticipants.length) {
//     return false;
//   }
//   for (let i = 0; i < prevParticipants.length; i++) {
//     if (prevParticipants[i].id !== nextParticipants[i].id) {
//       return false;
//     }
//   }
//   return true;
// };


export default CardParticipants;