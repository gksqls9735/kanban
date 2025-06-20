import { useEffect, useRef, useState } from "react";
import FieldLabel from "./field-common/field-label";
import FieldFooter from "./field-common/field-footer";
import { Task } from "../../../../types/type";
import useClickOutside from "../../../../hooks/use-click-outside";

const TextField: React.FC<{
  text?: string | null | undefined;
  isOwnerOrParticipant: boolean;
  handleChangeAndNotify: (updates: Partial<Task>) => void;
}> = ({
  text: initialTextProp,
  isOwnerOrParticipant,
  handleChangeAndNotify,
}) => {
  const initialText = initialTextProp ?? "";
  const fieldDisplayName = "텍스트";

  const [editingText, setEditingText] = useState<string>(initialText);
  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);

  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditingText(initialText);
  }, [initialText]);

  const resetToInitialState = () => {
    setEditingText(initialText);
  };

  const handleCancel = () => {
    setIsInEditMode(false);
    resetToInitialState();
  };

  const handleToggleEditMode = () => {
    if (!isOwnerOrParticipant && !isInEditMode) {
        return;
    }

    if (isInEditMode) {
      handleCancel();
    } else {
      setIsInEditMode(true);
      resetToInitialState(); 
    }
  };

  useClickOutside(editContainerRef, handleCancel, isInEditMode);

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setEditingText(e.target.value);
  };

  // ----- 추가된 부분: 키 다운 핸들러 -----
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter: 줄바꿈 (textarea의 기본 동작을 막지 않음)
        // React는 textarea의 value prop을 통해 줄바꿈을 제어하므로,
        // 별도의 추가 로직 없이 shiftKey가 true일 때 기본 동작을 허용하면 됩니다.
      } else {
        // Enter만 눌렀을 때: 저장
        e.preventDefault(); // Enter 키의 기본 동작 (새 줄 추가) 방지
        handleSave(); // 저장 함수 호출
      }
    }
  };
  // ------------------------------------------

  const handleSave = () => {
    const trimmedText = editingText.trim();

    if (initialText === "" && trimmedText === "") {
      handleChangeAndNotify({ memo: undefined }); // 텍스트가 비어있으면 null로 저장하여 필드 제거
      handleCancel();
      return;
    }
    handleChangeAndNotify({ memo: trimmedText });
    handleCancel();
  };

  if (!isInEditMode) {
    return (
      <li className="task-detail__detail-modal-field-item">
        <FieldLabel
          fieldName={fieldDisplayName}
          onClick={handleToggleEditMode}
        />
        <ul className="task-detail__detail-modal-field-content-list">
          {initialText ? (
            // `white-space: pre-wrap`을 사용하여 줄바꿈과 공백을 렌더링합니다.
            <span className="task-detail__detail-modal-field-item--text" style={{ whiteSpace: 'pre-wrap' }}>{initialText}</span>
          ) : (
            <span className="task-detail__detail-modal-field-edit-item--no-message">
              표시할 {fieldDisplayName}가 없습니다.
            </span>
          )}
        </ul>
      </li>
    );
  }

  const textEditorUI = (
    <textarea
      placeholder={`${fieldDisplayName} 입력 (공백 시 ${fieldDisplayName} 제거)`}
      onChange={handleTextareaChange}
      onKeyDown={handleTextareaKeyDown}
      value={editingText}
      className="task-detail__detail-modal-field-edit-textarea--text"
      autoFocus
      rows={4}
    />
  );

  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel
        fieldName={fieldDisplayName}
        onClick={handleToggleEditMode}
      />
      <ul className="task-detail__detail-modal-field-content-list">
        {initialText ? (
          // 편집 모드에서는 입력 필드가 보이므로 여기서는 원래 텍스트를 숨기거나,
          // 필요하다면 Read-only로 표시할 수 있습니다.
          // 현재는 isInEditMode가 true일 때 이 ul이 렌더링되지 않도록 되어 있어 이 부분은 괜찮습니다.
          <span className="task-detail__detail-modal-field-item--text">{initialText}</span>
        ) : (
          <span className="task-detail__detail-modal-field-edit-item--no-message">
            표시할 {fieldDisplayName}가 없습니다.
          </span>
        )}
      </ul>
      <div
        ref={editContainerRef}
        className="task-detail__detail-modal-field-edit-container"
      >
        {isOwnerOrParticipant ? (
          <>
            <div className="task-detail__detail-modal-field-edit-list-wrapper">
              {textEditorUI} 
              <div className="task-detail__detail-modal-field-edit-separator" />
            </div>
            <FieldFooter
              title={`${fieldDisplayName} 저장`}
              isPlusIcon={false}
              onClick={handleSave}
              handleCancel={handleCancel}
              isShowButton={true}
              onSave={handleSave}
            />
          </>
        ) : (
          null 
        )}
      </div>
    </li>
  );
};

export default TextField;