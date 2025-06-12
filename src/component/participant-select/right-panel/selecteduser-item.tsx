import { forwardRef } from "react";
import { Participant } from "../../../types/type";
import AvatarItem from "../../common/avatar/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { extractLastTeamName, getInitial } from "../../../utils/text-function";

interface SelectedUserItemProps {
  participant: Participant;
  onToggleDropdown: (id: string | number) => void;
  onRemove: (id: string | number) => void;
}

const SelectedUserItem = forwardRef<HTMLDivElement, SelectedUserItemProps>(
  ({ participant, onToggleDropdown, onRemove }, ref) => {
    return (
      <div key={participant.id} className="participant-modal__selected-item">
        <div className="participant-modal__selected-item-info">
          <AvatarItem size={40} src={participant.icon}>{getInitial(participant.username)}</AvatarItem>
          <div className="participant-modal__selected-item-text">
            <span className="participant-modal__selected-item-username" >{participant.username}</span>
            <span className="participant-modal__selected-item-team" >{extractLastTeamName(participant.team)}</span>
          </div>
        </div>
        <div className="participant-modal__selected-item-actions" >
          <div
            ref={ref}
            className="participant-modal__role-selector"
            onClick={e => { e.stopPropagation(); onToggleDropdown(participant.id) }}
          >
            <span className="participant-modal__role-text">{participant.isMain ? '주담당자' : '담당자'}</span>
            <FontAwesomeIcon icon={faCaretDown} className="participant-modal__role-icon" />
          </div>
          <div className="participant-modal__delete-action" onClick={() => onRemove(participant.id)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="#7D8998" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x" id="X--Streamline-Feather" height="16" width="16">
              <desc>X Streamline Icon: https://streamlinehq.com</desc>
              <path d="M11.25 3.75 3.75 11.25" strokeWidth="1"></path>
              <path d="m3.75 3.75 7.5 7.5" strokeWidth="1"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }
);

export default SelectedUserItem;