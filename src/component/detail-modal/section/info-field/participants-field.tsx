import { Participant, User } from "../../../../types/type";
import { getInitial } from "../../../../utils/text-function";
import AvatarItem from "../../../common/avatar/avatar";

import DeleteIcon from '../../../../assets/delete.svg?react';

const ParticipantsField: React.FC<{
  participants: Participant[];
  onDeleteParticipant: (userId: string | number, e: React.MouseEvent) => void;
  onAddParticipantClick: () => void;
  isOwnerOrParticipant: boolean;
  onClick: (e: React.MouseEvent, user: Participant | User | null) => void;
}> = ({ participants, onDeleteParticipant, onAddParticipantClick, isOwnerOrParticipant, onClick }) => {
  return (
    <div className="task-detail__detail-modal-info-row">
      <div className="task-detail__detail-modal-info-label">담당자</div>
      <div className="task-detail__detail-modal-info-value--participants">
        {participants.map(u =>
          <div key={u.id} className="task-detail__detail-modal-participant-item" onClick={e => onClick(e, u)}>
            <AvatarItem size={24} src={u.icon}>{getInitial(u.username)}</AvatarItem>
            <div className="task-detail__detail-modal-participant-name">{u.username}</div>
            {u.isMain && (<div className="participant-main-badge">주</div>)}
            {isOwnerOrParticipant && (
              <div onClick={e => onDeleteParticipant(u.id, e)} className="task-detail__detail-modal-participant-delete">
                <DeleteIcon width="16" height="16" />
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

