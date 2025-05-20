import { useRef, useState } from "react";
import { SelectOption } from "../../../../types/type";
import OptionItem from "../../common/option-item";
import ExpandToggle from "../../common/expand-toggle";
import FieldLabel from "./field-label";
import useClickOutside from "../../../../hooks/use-click-outside";

const MultiSelection: React.FC<{
  options: SelectOption[];
}> = ({ options }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const optionsToShow = isExpanded ? options : options.slice(0, 3);
  const hiddenCount = options.length - 3;

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
      <FieldLabel fieldName="다중선택" onClick={handleToggleEditMode} />
      <ul className="task-detail__detail-modal-field-content-list">
        {optionsToShow.map(option => (
          <OptionItem key={option.code} option={option} />
        ))}
        <ExpandToggle hiddenCount={hiddenCount} toggle={() => setIsExpanded(prev => !prev)} isExpanded={isExpanded} />
      </ul>
      {isInEditMode && (
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          <div className="task-detail__detail-modal-field-edit-list-wrapper">
            <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-url-list">
              {options.map(option => (
                <li key={option.code} className="task-detail__detail-modal-field-edit-url-item" style={{ gap: 10 }}>
                  <div className="participant-modal__checkbox-area" style={{ alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      className="participant-modal__checkbox--native"
                      onChange={() => { }}
                      checked={true}
                    />
                    <label className="participant-modal__checkbox--visual" />
                  </div>
                  <OptionItem option={option} />
                </li>
              ))}
            </ul>
            <div className="task-detail__detail-modal-field-edit-separator" />
          </div>
          <div className="task-detail__detail-modal-field-edit-footer">
            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#414D5C">
              <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
            </svg>
            <span className="task-detail__detail-modal-field-edit-footer-text">옵션 수정</span>
          </div>
        </div>
      )}
    </li>
  );
};

export default MultiSelection;