import { useEffect, useRef, useState } from "react";
import FieldLabel from "./field-common/field-label";
import useClickOutside from "../../../../hooks/use-click-outside";
import FieldFooter from "./field-common/field-footer";
import useTaskStore from "../../../../store/task-store";

const IdField: React.FC<{ prefix?: string | null | undefined, taskId: string }> = ({ prefix: initialPrefix = "", taskId }) => {
  const updateTask = useTaskStore(state => state.updateTask);

  const [prefix, setPrefix] = useState<string>("");

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  // edit-container를 참조하기 위한 ref 생성
  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrefix(initialPrefix ?? "");
  }, [initialPrefix]);

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

  const handleUpdatePrefix = (value: string) => setPrefix(value);

  const handleSubmit = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (e.key === "Enter") {
      handleSave();
    }
  }

  const handleSave = () => {
    const trimmedPrefix = prefix.trim();
    if (trimmedPrefix) {
      updateTask(taskId, { prefix: trimmedPrefix });
      handleCancel();
    }
  };

  const handleEdit = () => setIsOpenEdit(prev => !prev);

  if (!initialPrefix) {
    return (
      <li className="task-detail__detail-modal-field-item">
        <FieldLabel fieldName="ID" onClick={handleToggleEditMode} />
        <ul className="task-detail__detail-modal-field-content-list">
          <li className="task-detail__detail-modal-field-edit-item--no-message">
            표시할 ID가 존재하지 않습니다.
          </li>
        </ul>
        {isInEditMode && (
          <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <div>
                  <div className="task-detail__detail-modal-field-edit-id-input-row">
                    <div className="task-detail__detail-modal-field-edit-id-label">접두사</div>
                    <input
                      type="text"
                      placeholder="IT"
                      onChange={(e) => handleUpdatePrefix(e.target.value)}
                      onKeyDown={handleSubmit}
                      value={prefix}
                      className="task-detail__detail-modal-field-edit-input--prefix"
                    />
                  </div>
                  <div className="task-detail__detail-modal-field-edit-id-input-row  task-detail__detail-modal-field-edit-id-preview-row">
                    <div className="task-detail__detail-modal-field-edit-id-label">미리보기</div>
                    <div className="task-detail__detail-modal-field-edit-id-preview truncate">
                      {`${prefix}-1`}, {`${prefix}-2`}, {`${prefix}-3`}, ...
                    </div>
                  </div>
                </div>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="옵션 수정" isPlusIcon={false} onClick={handleEdit} handleCancel={handleCancel} isShowButton={true} onSave={handleSave} />
            </>
          </div>
        )}
      </li>
    )
  }

  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel fieldName="ID" onClick={handleToggleEditMode} />
      <ul className="task-detail__detail-modal-field-content-list">
        <li className="task-detail__detail-modal-field-value-item--id">{`${initialPrefix}-${taskId}`}</li>
      </ul>
      {isInEditMode && (
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          {isOpenEdit ? (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <div>
                  <div className="task-detail__detail-modal-field-edit-id-input-row">
                    <div className="task-detail__detail-modal-field-edit-id-label">접두사</div>
                    <input
                      type="text"
                      placeholder="IT"
                      onChange={(e) => handleUpdatePrefix(e.target.value)}
                      onKeyDown={handleSubmit}
                      value={prefix}
                      className="task-detail__detail-modal-field-edit-input--prefix"
                    />
                  </div>
                  <div className="task-detail__detail-modal-field-edit-id-input-row  task-detail__detail-modal-field-edit-id-preview-row">
                    <div className="task-detail__detail-modal-field-edit-id-label">미리보기</div>
                    <div className="task-detail__detail-modal-field-edit-id-preview truncate">
                      {`${prefix}-1`}, {`${prefix}-2`}, {`${prefix}-3`}, ...
                    </div>
                  </div>
                </div>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="옵션 수정" isPlusIcon={false} onClick={handleEdit} handleCancel={handleCancel} isShowButton={true} onSave={handleSave} />
            </>
          ) : (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <div className="task-detail__detail-modal-field-edit-id-view-input-wrapper">
                  <input type="text"
                    placeholder={`${initialPrefix}-1`}
                    className="task-detail__detail-modal-field-edit-input--id-view"
                    readOnly
                  />
                </div>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="옵션 수정" isPlusIcon={false} onClick={handleEdit} />
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default IdField;