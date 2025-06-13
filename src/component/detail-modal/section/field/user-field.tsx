import { useRef, useState } from "react";
import { Participant, Task, User } from "../../../../types/type";
import { getInitial } from "../../../../utils/text-function";
import AvatarItem from "../../../common/avatar/avatar";
import FieldLabel from "./field-common/field-label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import ParticipantSelector from "../../../participant-select/participant-selector";
import useClickOutside from "../../../../hooks/use-click-outside";
import FieldFooter from "./field-common/field-footer";

const UserField: React.FC<{
  users: Participant[], isOwnerOrParticipant: boolean,
  handleChangeAndNotify: (updates: Partial<Task>) => void,
  onClick: (e: React.MouseEvent, user: Participant | User | null) => void;
}> = ({ users, isOwnerOrParticipant, handleChangeAndNotify, onClick }) => {

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  // edit-container를 참조하기 위한 ref 생성
  const editContainerRef = useRef<HTMLDivElement>(null);

  // 취소 및 창 닫기 로직
  const handleCancel = () => {
    setIsInEditMode(false);
  };

  // FieldLabel 클릭 핸들러 (편집 모드 토글 및 초기 상태 설정)
  const handleToggleEditMode = () => {
    if (isInEditMode) {
      handleCancel(); // 이미 편집 모드면 닫기
    } else {
      setIsInEditMode(true);
    }
  };

  useClickOutside(editContainerRef, handleCancel, isInEditMode);

  const handleConfirm = (participants: Participant[]) => handleChangeAndNotify({ participants: participants });
  const handleDeleteParticipants = (userId: string) => {
    const updatedParticipants = users.filter(u => u.id !== userId);
    handleChangeAndNotify({ participants: updatedParticipants });
  };

  return (
    <>
      <li className="task-detail__detail-modal-field-item">
        <FieldLabel fieldName="사용자" onClick={handleToggleEditMode} />
        <ul className="task-detail__detail-modal-field-content-list task-detail__detail-modal-field-content-list--user">
          {users.map(user => (
            <li key={user.id} className="task-detail__detail-modal-field-value-item--user" onClick={e => onClick(e, user)}>
              <AvatarItem size={24} src={user.icon}>{getInitial(user.username)}</AvatarItem>
              <div>{user.username}</div>
            </li>
          ))}
          {users.length === 0 && (<li className="task-detail__detail-modal-field-edit-item--no-message">표시할 사용자가 없습니다.</li>)}
        </ul>
        {isInEditMode && (
          <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
            <div className="task-detail__detail-modal-field-edit-list-wrapper">
              <ul
                className="gantt-scrollbar-y task-detail__detail-modal-field-edit-list">
                {users.map(u => (
                  <li key={u.id} className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--user">
                    <div className="task-detail__detail-modal-field-edit-user-info" onClick={e => onClick(e, u)}>
                      <AvatarItem size={24} src={u.icon}>{getInitial(u.username)}</AvatarItem>
                      <div className="task-detail__detail-modal-field-edit-user-name">{u.username}</div>
                    </div>
                    {isOwnerOrParticipant && (
                      <div className="todo-item__action todo-item__action--delete" onClick={() => handleDeleteParticipants(u.id)}>
                        <FontAwesomeIcon icon={faTimes} className="task-detail__detail-modal-field-edit-item--delete" />
                      </div>
                    )}
                  </li>
                ))}
                {users.length === 0 && (<li className="task-detail__detail-modal-field-edit-item--no-message">표시할 사용자가 없습니다.</li>)}
              </ul>
              {isOwnerOrParticipant && (<div className="task-detail__detail-modal-field-edit-separator" />)}
            </div>
            {isOwnerOrParticipant && (<FieldFooter title="사용자 수정" isPlusIcon={true} onClick={() => setIsOpenEdit(prev => !prev)} />)}
          </div>
        )}
      </li>
      {isOpenEdit && (
        <ParticipantSelector
          initialParticipants={users} onClose={() => setIsOpenEdit(false)} onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default UserField;