import { useRef, useState } from "react";
import { SelectOption } from "../../../../types/type";
import OptionItem from "../../common/option-item";
import FieldLabel from "./field-common/field-label";
import useClickOutside from "../../../../hooks/use-click-outside";
import { lightenColor } from "../../../../utils/color-function";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SelectionDropdown from "./selection-dropdown";
import SelectionCheckBox from "./field-common/selection-checkbox";
import FieldFooter from "./field-common/field-footer";

const SingleSelection: React.FC<{ option: SelectOption }> = ({ option }) => {

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
      <FieldLabel fieldName="단일선택" onClick={handleToggleEditMode} />
      <div className="task-detail__detail-modal-field-content-list">
        <OptionItem option={option} />
      </div>
      {isInEditMode && (
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          {isOpenEdit ? (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
                  <li className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--option" >
                    <div className="task-detail__detail-modal-field-edit-item-drag-handle">⠿</div>
                    <div className="task-detail__detail-modal-field-edit-option-display">
                      <SelectionCheckBox width={12} height={12} borderColor={option.colorMain} backgroundColor={option.colorSub || lightenColor(option.colorMain, 0.85)} />
                      <div className="task-detail__detail-modal-field-edit-option-name">{option.name}</div>
                    </div>
                    <div className="task-detail__detail-modal-field-edit-option-actions">
                      <SelectionDropdown />
                      <div className="todo-item__action todo-item__action--delete">
                        <FontAwesomeIcon icon={faTimes} className="task-detail__detail-modal-field-edit-item--delete" />
                      </div>
                    </div>
                  </li>
                  <li className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--option" >
                    <div className="task-detail__detail-modal-field-edit-item-drag-handle">⠿</div>
                    <div className="task-detail__detail-modal-field-edit-option-display">
                      <SelectionCheckBox width={12} height={12} borderColor={option.colorMain} backgroundColor={option.colorSub || lightenColor(option.colorMain, 0.85)} />
                      <div className="task-detail__detail-modal-field-edit-option-input-wrapper">
                        <input type="text" placeholder="옵션을 입력해주세요." />
                      </div>
                    </div>
                    <div className="task-detail__detail-modal-field-edit-option-actions">
                      <SelectionDropdown />
                      <div className="todo-item__action todo-item__action--delete">
                        <FontAwesomeIcon icon={faTimes} className="task-detail__detail-modal-field-edit-item--delete" />
                      </div>
                    </div>
                  </li>
                </ul>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="옵션 추가" isPlusIcon={true} onClick={() => setIsOpenEdit(prev => !prev)} handleCancel={handleCancel} isShowButton={true} />
            </>
          ) : (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
                  <li className="task-detail__detail-modal-field-edit-item">
                    <div className="radio-icon-container">
                      <div className="radio-icon-outer">
                        <div className="radio-icon-inner"></div>
                      </div>
                    </div>
                    <OptionItem option={option} />
                  </li>
                </ul>
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

export default SingleSelection;