import { useRef, useState } from "react";
import { NumericField } from "../../../../types/type";
import FieldLabel from "./field-common/field-label";
import NumericDropdown from "./numeric-dropdown";
import useClickOutside from "../../../../hooks/use-click-outside";
import FieldFooter from "./field-common/field-footer";

const NumericFieldComponent: React.FC<{ numericField: NumericField }> = ({ numericField }) => {
  const formattedValue = numericField.value.toFixed(numericField.decimalPlaces);

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  const unitList = [
    "숫자", "퍼센트", "KRW", "USD", "EUR", "JPY", "CNY", "사용자 지정 테이블", "형식 없음"
  ];

  const decimalList = [
    0, 1, 2, 3, 4, 5, 6
  ]


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
      <FieldLabel fieldName="숫자" onClick={handleToggleEditMode} />
      <ul className="task-detail__detail-modal-field-content-list">
        <li className="task-detail__detail-modal-field-item--numeric">
          <div>{formattedValue}</div>
          <div>{numericField.unit}</div>
        </li>
      </ul>
      {isInEditMode && (
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          {isOpenEdit ? (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <div className="task-detail__detail-modal-field-edit-numeric-options">
                  <NumericDropdown title="형식" currentValue={numericField.unit} dropdownList={unitList} />
                  {numericField.decimalPlaces !== undefined && (<NumericDropdown title="소수 자릿수" currentValue={numericField.decimalPlaces} dropdownList={decimalList} />)}
                  <div className="task-detail__detail-modal-field-edit-numeric-row task-detail__detail-modal-field-edit-numeric-preview-row">
                    <div className="task-detail__detail-modal-field-edit-numeric-label">미리보기</div>
                    <div className="task-detail__detail-modal-field-edit-numeric-preview-value">
                      {`${formattedValue}${numericField.unit}`}
                    </div>
                  </div>
                </div>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <div className="task-detail__detail-modal-field-edit-footer task-detail__detail-modal-field-edit-footer--numeric-edit">
                <div className="task-detail__detail-modal-field-footer-actions">
                  <div onClick={handleCancel}>취소</div>
                  <div>저장</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <div style={{
                  padding: '0px 10px',
                }}>
                  <input type="text"
                    placeholder={`${formattedValue} ${numericField.unit}`}
                    readOnly
                    className="task-detail__detail-modal-field-edit-input--numeric-view"
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

export default NumericFieldComponent;