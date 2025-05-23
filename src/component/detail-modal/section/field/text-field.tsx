import { useRef, useState } from "react";
import FieldLabel from "./field-common/field-label";
import useClickOutside from "../../../../hooks/use-click-outside";

const TextField: React.FC<{ text?: string }> = ({ text }) => {

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [_isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
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
      <FieldLabel fieldName="텍스트" onClick={handleToggleEditMode} />
      <ul className="task-detail__detail-modal-field-content-list">
        {text ? (
          <span className="task-detail__detail-modal-field-item--text">{text}</span>
        ) : (
          <span className="task-detail__detail-modal-field-edit-item--no-message">표시할 텍스트가 존재하지 않습니다.</span>
        )}
      </ul>
      {/* {isInEditMode && (
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          편집 UI 영역 (예: "dk")
        </div>
      )} */}
    </li>
  );
};

export default TextField; 