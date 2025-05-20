import { useRef, useState } from "react";
import FieldLabel from "./field-label";
import useClickOutside from "../../../../hooks/use-click-outside";

const IdField: React.FC<{ prefix: string, taskId: string }> = ({ prefix, taskId }) => {
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
      <FieldLabel fieldName="ID" onClick={handleToggleEditMode} />
      <ul className="task-detail__detail-modal-field-content-list">
        <li className="task-detail__detail-modal-field-value-item--id">{`${prefix}-${taskId}`}</li>
      </ul>
      {isInEditMode && (
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          {isOpenEdit ? (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <div>
                  <div style={{ height: 40, display: 'flex', gap: 8, padding: '0px 12px', boxSizing: 'border-box', alignItems: 'center' }}>
                    <div style={{ width: 96, padding: '4px 0px', boxSizing: 'border-box', fontSize: 13, fontWeight: 400, color: '#0F1B2A' }}>접두사</div>
                    <input type="text" placeholder="IT" value={prefix}
                      style={{
                        height: 32, boxSizing: 'border-box', flexGrow: 1,
                        border: '1px solid #E4E8EE', borderRadius: 4, padding: '0px 10px',
                        outline: 'none', fontSize: 13, fontWeight: 400, color: '#8D99A8'
                      }} />
                  </div>
                  <div style={{ height: 40, display: 'flex', gap: 8, padding: '0px 12px', boxSizing: 'border-box', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: 96, padding: '4px 0px', boxSizing: 'border-box', fontSize: 13, fontWeight: 400, color: '#0F1B2A' }}>미리보기</div>
                    <div style={{ textAlign: 'right', fontWeight: 400, fontSize: 13, color: '#0F1B2A' }}>
                      {`${prefix}-1`}, {`${prefix}-2`}, {`${prefix}-3`}, ...
                    </div>
                  </div>
                </div>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <div className="task-detail__detail-modal-field-edit-footer" onClick={() => setIsOpenEdit(prev => !prev)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#414D5C">
                  <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                </svg>
                <span className="task-detail__detail-modal-field-edit-footer-text">옵션 수정</span>
              </div>
            </>
          ) : (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <div style={{
                  padding: '0px 10px',
                }}>
                  <input type="text"
                    placeholder={`${prefix}-1`}
                    style={{
                      width: '100%',
                      height: 36,
                      border: '1px solid #E4E8EE',
                      borderRadius: 4, color: '#CDD3DD', fontSize: 14,
                      outline: 'none'
                    }} />
                </div>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <div className="task-detail__detail-modal-field-edit-footer" onClick={() => setIsOpenEdit(prev => !prev)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#414D5C">
                  <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                </svg>
                <span className="task-detail__detail-modal-field-edit-footer-text">옵션 수정</span>
              </div>
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default IdField;