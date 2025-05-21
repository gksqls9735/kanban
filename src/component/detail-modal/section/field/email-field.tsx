import { useRef, useState } from "react";
import { Email } from "../../../../types/type";
import FieldLabel from "./field-common/field-label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import useClickOutside from "../../../../hooks/use-click-outside";
import FieldFooter from "./field-common/field-footer";

const EmailField: React.FC<{ emails: Email[] }> = ({ emails }) => {
  const handleCopyEmail = (emailAddress: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(emailAddress);
  };

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  // edit-container를 참조하기 위한 ref 생성
  const editContainerRef = useRef<HTMLDivElement>(null);

  // 취소 및 창 닫기 로직
  const handleCancel = () => {
    setIsInEditMode(false);
    setIsOpenEdit(false);
  };

  // FieldLabel 클릭 핸들러 (편집 모드 토글 및 초기 상태 설정)
  const handleToggleEditMode = () => {
    if (isInEditMode) {
      handleCancel(); // 이미 편집 모드면 닫기
    } else {
      setIsInEditMode(true);
      setIsOpenEdit(false); // 편집 모드 진입 시, 기본적으로는 목록 뷰(isOpenEdit: false)로 시작
    }
  };

  useClickOutside(editContainerRef, handleCancel, isInEditMode);

  return (
    <li className="task-detail__detail-modal-field-item">
      {/* FieldLabel 클릭 시 handleToggleEditMode 호출 */}
      <FieldLabel fieldName="이메일" onClick={handleToggleEditMode} />
      <ul className="task-detail__detail-modal-field-content-list">
        {emails.map(email => (
          <li key={email.id} onClick={() => handleCopyEmail(email.email)}
            className="task-detail__detail-modal-field-value-item task-detail__detail-modal-field-item--email">
            {email.nickname}
          </li>
        ))}
      </ul>
      {isInEditMode && (
        // ref를 div에 연결
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          {isOpenEdit ? (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
                  {emails.map(email => (
                    <li key={email.id} className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--url-email">
                      <div className="task-detail__detail-modal-field-edit-item-drag-handle">⠿</div>
                      <div className="task-detail__detail-modal-field-edit-item-inputs">
                        <input type="text"
                          className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--first"
                          placeholder="이름을 입력하세요."
                          defaultValue={email.nickname}
                          onChange={() => {}}
                        />
                        <input type="text"
                          className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--second"
                          placeholder="@mail.bizbee.ne.kr"
                          defaultValue={email.email} 
                          onChange={() => {}}
                        />
                      </div>
                      <div className="todo-item__action todo-item__action--delete">
                        <FontAwesomeIcon icon={faTimes} className="task-detail__detail-modal-field-edit-item--delete" />
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="이메일 추가" isPlusIcon={true} onClick={() => setIsOpenEdit(prev => !prev)} handleCancel={handleCancel} isShowButton={true} />
            </>
          ) : (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <ul
                  className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
                  {emails.map(email => (
                    <li key={email.id} className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--email">
                      <div className="task-detail__detail-modal-field-edit-item--email--nickname">{email.nickname}</div>
                      <div className="task-detail__detail-modal-field-edit-item-email--email">{email.email}</div>
                    </li>
                  ))}
                </ul>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="이메일 수정" isPlusIcon={false} onClick={() => setIsOpenEdit(prev => !prev)} />
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default EmailField;
