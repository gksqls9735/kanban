import { useRef, useState } from "react";
import FieldLabel from "./field-common/field-label";
import useClickOutside from "../../../../hooks/use-click-outside";
import FieldFooter from "./field-common/field-footer";

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
                  <div className="task-detail__detail-modal-field-edit-id-input-row">
                    <div className="task-detail__detail-modal-field-edit-id-label">접두사</div>
                    <input type="text" placeholder="IT" value={prefix} className="task-detail__detail-modal-field-edit-input--prefix" />
                  </div>
                  <div className="task-detail__detail-modal-field-edit-id-input-row  task-detail__detail-modal-field-edit-id-preview-row">
                    <div className="task-detail__detail-modal-field-edit-id-label">미리보기</div>
                    <div className="task-detail__detail-modal-field-edit-id-preview">
                      {`${prefix}-1`}, {`${prefix}-2`}, {`${prefix}-3`}, ...
                    </div>
                  </div>
                </div>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="옵션 수정" isPlusIcon={false} onClick={() => setIsOpenEdit(prev => !prev)} handleCancel={handleCancel} isShowButton={true} />
            </>
          ) : (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <div className="task-detail__detail-modal-field-edit-id-view-input-wrapper">
                  <input type="text"
                    placeholder={`${prefix}-1`}
                    onChange={() => { }}
                    className="task-detail__detail-modal-field-edit-input--id-view"
                  />
                </div>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="옵션 수정" isPlusIcon={false} onClick={() => setIsOpenEdit(prev => !prev)} />
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default IdField;