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
                <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-url-list">
                  <li className="task-detail__detail-modal-field-edit-url-item" style={{ gap: 12 }}>
                    <div style={{ width: 16, height: 16, color: '#D9D9D9', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'grab' }}>⠿</div>
                    <div style={{ display: 'flex', alignItems: 'center', height: 24, borderRadius: 4, gap: 6, flexGrow: 1 }}>
                      <SelectionCheckBox width={12} height={12} borderColor={option.colorMain} backgroundColor={option.colorSub || lightenColor(option.colorMain, 0.85)}/>
                      <div style={{ fontSize: 13, fontWeight: 400 }}>{option.name}</div>
                    </div>
                    <div style={{display: 'flex', gap: 8}}>
                      <SelectionDropdown/>
                      <div className="todo-item__action todo-item__action--delete">
                        <FontAwesomeIcon icon={faTimes} style={{ width: 12, height: 12, color: "rgba(125, 137, 152, 1)", cursor: 'pointer' }} />
                      </div>
                    </div>
                  </li>
                  <li className="task-detail__detail-modal-field-edit-url-item" style={{ gap: 12 }}>
                    <div style={{ width: 16, height: 16, color: '#D9D9D9', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'grab' }}>⠿</div>
                    <div style={{ display: 'flex', alignItems: 'center', height: 24, borderRadius: 4, gap: 6, flexGrow: 1 }}>
                      <SelectionCheckBox width={12} height={12} borderColor={option.colorMain} backgroundColor={option.colorSub || lightenColor(option.colorMain, 0.85)}/>
                      <div style={{ fontSize: 13, fontWeight: 400, flexGrow: 1 }}>
                        <input type="text" style={{ width: '100%', border: 'none', outline: 'none', color: '#8D99A8'}} placeholder="옵션을 입력해주세요." />
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: 8}}>
                      <SelectionDropdown/>
                      <div className="todo-item__action todo-item__action--delete">
                        <FontAwesomeIcon icon={faTimes} style={{ width: 12, height: 12, color: "rgba(125, 137, 152, 1)", cursor: 'pointer' }} />
                      </div>
                    </div>
                  </li>
                </ul>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <div className="task-detail__detail-modal-field-edit-footer" style={{ justifyContent: 'space-between' }}>
                <div style={{ width: 'fit-content', display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }} onClick={() => setIsOpenEdit(prev => !prev)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#414D5C" className="bi bi-plus-lg" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                  </svg>
                  <span className="task-detail__detail-modal-field-edit-footer-text">옵션 추가</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* 취소 버튼에도 handleCancel 연결 */}
                  <div style={{ width: 40, height: 28, fontWeight: 500, fontSize: 13, color: '#8D99A8', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }} onClick={() => setIsOpenEdit(prev => !prev)}>취소</div>
                  <div style={{ width: 40, height: 28, fontWeight: 500, fontSize: 13, color: '#16B364', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>저장</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-url-list">
                  <li className="task-detail__detail-modal-field-edit-url-item">
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
              <div className="task-detail__detail-modal-field-edit-footer" style={{ justifyContent: 'space-between' }}>
                <div style={{ width: 'fit-content', display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }} onClick={() => setIsOpenEdit(prev => !prev)}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#414D5C">
                    <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                  </svg>
                  <span className="task-detail__detail-modal-field-edit-footer-text">옵션 수정</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default SingleSelection;