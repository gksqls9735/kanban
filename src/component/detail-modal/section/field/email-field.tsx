import { useEffect, useRef, useState } from "react";
import { Email } from "../../../../types/type";
import FieldLabel from "./field-label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const path = e.composedPath();
      if (isInEditMode &&
        editContainerRef.current && !path.includes(editContainerRef.current)
      ) handleCancel();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isInEditMode]);
  
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
                <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-url-list">
                  {emails.map(email => (
                    <li key={email.id} className="task-detail__detail-modal-field-edit-url-item" style={{ gap: 12 }}> {/* `email.id`를 key로 사용 */}
                      <div style={{ width: 16, height: 16, color: '#D9D9D9', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'grab' }}>⠿</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="text"
                          placeholder="이름을 입력하세요."
                          style={{ width: 128, height: 32, border: '1px solid #E4E8EE', borderRadius: 4, padding: '0px 10px', outline: 'none', color: '#8D99A8', boxSizing: 'border-box' }}
                          defaultValue={email.nickname} // value 대신 defaultValue 또는 상태 관리 필요
                        />
                        <input type="text"
                          placeholder="@mail.bizbee.ne.kr"
                          style={{ width: 348, height: 32, border: '1px solid #E4E8EE', borderRadius: 4, padding: '0px 10px', outline: 'none', color: '#8D99A8', boxSizing: 'border-box' }}
                          defaultValue={email.email} // value 대신 defaultValue 또는 상태 관리 필요
                        />
                      </div>
                      <div className="todo-item__action todo-item__action--delete">
                        <FontAwesomeIcon icon={faTimes} style={{ width: 12, height: 12, color: "rgba(125, 137, 152, 1)", cursor: 'pointer' }} />
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
                <span className="task-detail__detail-modal-field-edit-footer-text">이메일 추가</span>
              </div>
            </>
          ) : (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <ul
                  className="kanban-scrollbar-y task-detail__detail-modal-field-edit-url-list">
                  {emails.map(email => (
                    <li key={email.id} className="task-detail__detail-modal-field-edit-url-item" style={{ gap: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0F1B2A' }}>{email.nickname}</div>
                      <div style={{ fontWeight: 400, fontSize: 13, color: '#5F6B7A' }}>{email.email}</div>
                    </li>
                  ))}
                </ul>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <div className="task-detail__detail-modal-field-edit-footer" style={{ justifyContent: 'space-between' }}>
                <div style={{ width: 'fit-content', display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }} onClick={() => setIsOpenEdit(prev => !prev)}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#414D5C">
                    <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                  </svg>
                  <span className="task-detail__detail-modal-field-edit-footer-text">이메일 수정</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* 취소 버튼에도 handleCancel 연결 */}
                  <div style={{ width: 40, height: 28, fontWeight: 500, fontSize: 13, color: '#8D99A8', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }} onClick={handleCancel}>취소</div>
                  <div style={{ width: 40, height: 28, fontWeight: 500, fontSize: 13, color: '#16B364', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>저장</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default EmailField;

// 쉐도우 돔 인식하도록 변경