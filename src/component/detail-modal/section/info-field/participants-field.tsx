import { Participant } from "../../../../types/type";
import { getInitial } from "../../../../utils/text-function";
import AvatarItem from "../../../common/avatar/avatar";

const ParticipantsField: React.FC<{
  participants: Participant[];
  onDeleteParticipant: (userId: string | number) => void;
  onAddParticipantClick: () => void;
  isOwnerOrParticipant: boolean;
}> = ({ participants, onDeleteParticipant, onAddParticipantClick, isOwnerOrParticipant }) => {
  return (
    <div className="task-detail__detail-modal-info-row">
      <div className="task-detail__detail-modal-info-label">담당자</div>
      <div className="task-detail__detail-modal-info-value--participants">
        {participants.map(u =>
          <div key={u.id} className="task-detail__detail-modal-participant-item">
            <AvatarItem size={24} src={u.icon}>{getInitial(u.username)}</AvatarItem>
            <div className="task-detail__detail-modal-participant-name">{u.username}</div>
            {u.isMain && (<div className="participant-main-badge">주</div>)}
            {isOwnerOrParticipant && (
              <div onClick={() => onDeleteParticipant(u.id)} className="task-detail__detail-modal-participant-delete">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="#7D8998" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x" id="X--Streamline-Feather" height="16" width="16">
                  <desc>X Streamline Icon: https://streamlinehq.com</desc>
                  <path d="M11.25 3.75 3.75 11.25" strokeWidth="1"></path>
                  <path d="m3.75 3.75 7.5 7.5" strokeWidth="1"></path>
                </svg>
              </div>
            )}
          </div>
        )}
        {isOwnerOrParticipant && (
          <div onClick={onAddParticipantClick} className="task-detail__detail-modal-participant-add">
            <AvatarItem key="add" isOverflow={true} size={24} isFirst={false}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#8D99A8" className="bi bi-plus-lg" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
              </svg>
            </AvatarItem>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantsField;