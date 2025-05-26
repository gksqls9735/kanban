// IdField.tsx
import { useEffect, useRef, useState } from "react";
import FieldLabel from "./field-common/field-label";
import useClickOutside from "../../../../hooks/use-click-outside";
import FieldFooter from "./field-common/field-footer";
import useTaskStore from "../../../../store/task-store";

const IdField: React.FC<{ prefix?: string | null | undefined, taskId: string, isOwnerOrParticipant: boolean }> = ({ prefix: initialPrefixProp, taskId, isOwnerOrParticipant }) => {
  const updateTask = useTaskStore(state => state.updateTask);

  // initialPrefixProp이 null 또는 undefined일 경우 빈 문자열로 처리
  const initialPrefix = initialPrefixProp ?? "";

  const [editingPrefix, setEditingPrefix] = useState<string>(initialPrefix);
  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false); // true: 실제 접두사 입력 UI, false: 초기 프롬프트 또는 읽기 전용 뷰

  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // initialPrefixProp (외부에서 전달된 prop)이 변경될 때 editingPrefix 상태 업데이트
    setEditingPrefix(initialPrefix);
  }, [initialPrefix]);

  // 편집 중인 상태를 초기값(initialPrefix)으로 되돌리는 함수
  const resetToInitialState = () => {
    setEditingPrefix(initialPrefix);
  };

  // 편집 모드 전체 취소 처리
  const handleCancel = () => {
    setIsInEditMode(false);
    setIsOpenEdit(false);
    resetToInitialState(); // 현재 편집중인 내용을 초기값으로 복원
  };

  // FieldLabel 클릭 또는 편집 모드 진입/종료 토글
  const handleToggleEditMode = () => {
    if (isInEditMode) {
      handleCancel(); // 이미 편집 모드라면 전체 취소
    } else {
      setIsInEditMode(true);
      setIsOpenEdit(false); // 편집 모드 진입 시, 항상 초기 프롬프트 또는 읽기 전용 뷰로 시작
      resetToInitialState(); // 현재 설정된 prefix 값을 편집 상태로 불러옴
    }
  };

  useClickOutside(editContainerRef, handleCancel, isInEditMode);

  // 접두사 입력 값 변경 핸들러
  const handlePrefixInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingPrefix(e.target.value);
  };

  // 접두사 저장 로직
  const handleSave = () => {
    const trimmedPrefix = editingPrefix.trim();

    // 만약 기존 접두사가 없고, 새로 입력한 접두사도 없다면 (즉, 변경사항이 없다면) 저장하지 않고 취소
    if (initialPrefix === "" && trimmedPrefix === "") {
      handleCancel();
      return;
    }
    // 실제 업데이트 로직 (여기서는 빈 문자열 저장을 허용하여 접두사 제거 기능으로 활용)
    updateTask(taskId, { prefix: trimmedPrefix });
    handleCancel(); // 저장 후 편집 모드 종료 및 상태 초기화
  };

  // Enter 키로 저장 제출
  const handleSubmitOnEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  }

  // --- 조회 모드 (isInEditMode가 false일 때) ---
  if (!isInEditMode) {
    if (!initialPrefix) { // 초기 접두사 값이 없을 경우
      return (
        <li className="task-detail__detail-modal-field-item">
          <FieldLabel fieldName="ID" onClick={handleToggleEditMode} />
          <ul className="task-detail__detail-modal-field-content-list">
            <li className="task-detail__detail-modal-field-edit-item--no-message">
              표시할 ID가 없습니다.
            </li>
          </ul>
        </li>
      );
    }
    // 초기 접두사 값이 있을 경우
    return (
      <li className="task-detail__detail-modal-field-item">
        <FieldLabel fieldName="ID" onClick={handleToggleEditMode} />
        <ul className="task-detail__detail-modal-field-content-list">
          {/* 실제 ID는 prefix와 taskId의 조합. taskId가 길 경우 일부만 표시 (예: 뒤 6자리) */}
          <li className="task-detail__detail-modal-field-value-item--id">{`${initialPrefix}-${taskId.slice(-6)}`}</li>
        </ul>
      </li>
    );
  }

  // --- 편집 모드 (isInEditMode가 true일 때) ---
  // 공통으로 사용될 접두사 입력 UI
  const prefixEditorUI = (
    <div>
      <div className="task-detail__detail-modal-field-edit-id-input-row">
        <div className="task-detail__detail-modal-field-edit-id-label">접두사</div>
        <input
          type="text"
          placeholder="예: IT (공백 시 접두사 제거)"
          onChange={handlePrefixInputChange}
          onKeyDown={handleSubmitOnEnter}
          value={editingPrefix}
          className="task-detail__detail-modal-field-edit-input--prefix"
          autoFocus // 편집 UI가 나타날 때 자동으로 포커스
        />
      </div>
      <div className="task-detail__detail-modal-field-edit-id-input-row task-detail__detail-modal-field-edit-id-preview-row">
        <div className="task-detail__detail-modal-field-edit-id-label">미리보기</div>
        <div className="task-detail__detail-modal-field-edit-id-preview truncate">
          {/* 미리보기: 현재 편집중인 접두사와 taskId 조합 또는 접두사 없을 시 안내 */}
          {editingPrefix.trim() ? `${editingPrefix.trim()}-${taskId.slice(-6)}` : `${taskId.slice(-6)}`}
        </div>
      </div>
    </div>
  );

  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel fieldName="ID" onClick={handleToggleEditMode} />
      <ul className="task-detail__detail-modal-field-content-list">
        {initialPrefix ? (
          <li className="task-detail__detail-modal-field-value-item--id">{`${initialPrefix}-${taskId.slice(-6)}`}</li>
        ) : (
          <li className="task-detail__detail-modal-field-edit-item--no-message">
            표시할 ID가 없습니다.
          </li>
        )}
      </ul>
      <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
        {!initialPrefix ? (
          // Case 1: ID 접두사가 없는 경우 (새로 생성)
          <>
            {!isOpenEdit ? (
              // Step 1.1: 접두사 정의를 위한 프롬프트
              <>
                <div className="task-detail__detail-modal-field-edit-list-wrapper">
                  <div className="task-detail__detail-modal-field-edit-item--no-message">
                    표시할 ID가 없습니다.
                  </div>
                  {isOwnerOrParticipant && <div className="task-detail__detail-modal-field-edit-separator" />}
                </div>
                {isOwnerOrParticipant && ( // 소유자/참여자만 접두사 정의 가능
                  <FieldFooter
                    title="옵션 추가"
                    isPlusIcon={false}
                    onClick={() => setIsOpenEdit(true)} // 실제 입력 UI(isOpenEdit=true)로 전환
                    handleCancel={handleCancel} // 전체 편집 모드 취소
                    isShowButton={true}
                  />
                )}
              </>
            ) : (
              // Step 1.2: 실제 새 접두사 입력 UI
              <>
                <div className="task-detail__detail-modal-field-edit-list-wrapper">
                  {prefixEditorUI}
                  <div className="task-detail__detail-modal-field-edit-separator" />
                </div>
                <FieldFooter // 새 접두사 저장용 푸터
                  title="옵션 추가"
                  isPlusIcon={true}
                  onClick={handleSave}
                  handleCancel={handleCancel} // 전체 편집 모드 취소
                  isShowButton={true}
                  onSave={handleSave}
                />
              </>
            )}
          </>
        ) : (
          // Case 2: ID 접두사가 이미 있는 경우 (수정)
          <>
            {!isOpenEdit ? (
              // Step 2.1: 현재 ID를 보여주는 읽기 전용 뷰
              <>
                <div className="task-detail__detail-modal-field-edit-list-wrapper">
                  <div className="task-detail__detail-modal-field-edit-id-view-input-wrapper">
                    <input
                      type="text"
                      value={`${initialPrefix}-${taskId.slice(-6)}`} // 현재 설정된 ID 표시
                      className="task-detail__detail-modal-field-edit-input--id-view" // 읽기 전용 스타일 적용 필요
                      readOnly
                    />
                  </div>
                  {isOwnerOrParticipant && <div className="task-detail__detail-modal-field-edit-separator" />}
                </div>
                {isOwnerOrParticipant && ( // 소유자/참여자만 접두사 변경 가능
                  <FieldFooter
                    title="옵션 변경"
                    isPlusIcon={false}
                    onClick={() => setIsOpenEdit(true)} // 실제 편집 UI(isOpenEdit=true)로 전환
                    handleCancel={handleCancel} // 전체 편집 모드 취소
                    isShowButton={true}
                  />
                )}
              </>
            ) : (
              // Step 2.2: 기존 접두사 수정 UI
              <>
                <div className="task-detail__detail-modal-field-edit-list-wrapper">
                  {prefixEditorUI}
                  <div className="task-detail__detail-modal-field-edit-separator" />
                </div>
                <FieldFooter // 수정된 접두사 저장용 푸터
                  title="옵션 저장" // 저장 버튼명 명확화
                  isPlusIcon={false}
                  onClick={handleSave}
                  handleCancel={() => { // 편집 UI에서 취소 시, 읽기 전용 뷰로 돌아감
                    setIsOpenEdit(false);
                    resetToInitialState(); // 입력 값 변경사항 초기화
                  }}
                  isShowButton={true}
                  onSave={handleSave}
                />
              </>
            )}
          </>
        )}
      </div>
    </li>
  );
};

export default IdField;