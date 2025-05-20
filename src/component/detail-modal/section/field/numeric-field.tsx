import { useRef, useState } from "react";
import { NumericField } from "../../../../types/type";
import FieldLabel from "./field-label";
import NumericDropdown from "./numeric-dropdown";
import useClickOutside from "../../../../hooks/use-click-outside";

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
                <div style={{ padding: '0px 12px' }}>
                  <NumericDropdown title="형식" currentValue={numericField.unit} dropdownList={unitList} />
                  {numericField.decimalPlaces !== undefined && (<NumericDropdown title="소수 자릿수" currentValue={numericField.decimalPlaces} dropdownList={decimalList} />)}
                  <div style={{ height: 40, display: 'flex', gap: 8, padding: '0px 12px', boxSizing: 'border-box', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: 96, padding: '4px 0px', boxSizing: 'border-box', fontSize: 13, fontWeight: 400, color: '#0F1B2A' }}>미리보기</div>
                    <div style={{ textAlign: 'right', fontWeight: 400, fontSize: 13, color: '#0F1B2A' }}>
                      {`${formattedValue}${numericField.unit}`}
                    </div>
                  </div>
                </div>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <div className="task-detail__detail-modal-field-edit-footer" style={{ justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 40, height: 28, fontWeight: 500, fontSize: 13, color: '#8D99A8', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={handleCancel}>취소</div>
                  <div style={{ width: 40, height: 28, fontWeight: 500, fontSize: 13, color: '#16B364', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>저장</div>
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
                    style={{
                      width: '100%',
                      height: 36,
                      border: '1px solid #E4E8EE',
                      borderRadius: 4, color: '#0F1B2A', fontSize: 14,
                      outline: 'none',
                      textAlign: 'right'
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

export default NumericFieldComponent;