import { useState } from "react";
import { Participant } from "../../../../types/type";
import { getInitial } from "../../../../utils/text-function";
import AvatarItem from "../../../avatar/avatar";
import FieldLabel from "./field-label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import ParticipantSelector from "../../../participant-select/participant-selector";

const UserField: React.FC<{ users: Participant[] }> = ({ users }) => {

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  return (
    <>
      <li className="task-detail__detail-modal-field-item">
        <FieldLabel fieldName="사용자" onClick={() => setIsInEditMode(prev => !prev)} />
        <ul className="task-detail__detail-modal-field-content-list task-detail__detail-modal-field-content-list--user">
          {users.map(user => (
            <li key={user.id} className="task-detail__detail-modal-field-value-item--user">
              <AvatarItem size={24}>{getInitial(user.username)}</AvatarItem>
              <div>{user.username}</div>
            </li>
          ))}
        </ul>
        {isInEditMode && (
          <div className="task-detail__detail-modal-field-edit-container">
            <div className="task-detail__detail-modal-field-edit-list-wrapper">
              <ul
                className="kanban-scrollbar-y task-detail__detail-modal-field-edit-url-list">
                {users.map(u => (
                  <li key={u.id} className="task-detail__detail-modal-field-edit-url-item" style={{ justifyContent: 'space-between', }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <AvatarItem size={24}>{getInitial(u.username)}</AvatarItem>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0F1B2A' }}>{u.username}</div>
                    </div>
                    <div className="todo-item__action todo-item__action--delete">
                      <FontAwesomeIcon icon={faTimes} style={{ width: 12, height: 12, color: "rgba(125, 137, 152, 1)" }} />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="task-detail__detail-modal-field-edit-separator" />
            </div>
            <div className="task-detail__detail-modal-field-edit-footer" onClick={() => setIsOpenEdit(prev => !prev)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#414D5C" className="bi bi-plus-lg" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
              </svg>
              <span className="task-detail__detail-modal-field-edit-footer-text">사용자 추가</span>
            </div>
          </div>
        )}
      </li>
      {isOpenEdit && (
        <ParticipantSelector
          initialParticipants={users} onClose={() => setIsOpenEdit(false)} onConfirm={() => {}}
        />
      )}
    </>
  );
};

export default UserField;