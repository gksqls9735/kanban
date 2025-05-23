// NumericFieldComponent.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { MeasurementUnit, NumericField } from "../../../../types/type"; // 경로는 실제 프로젝트에 맞게 조정해주세요.
import FieldLabel from "./field-common/field-label";
import useClickOutside from "../../../../hooks/use-click-outside";
import FieldFooter from "./field-common/field-footer";
import NumericDropdown from "./field-dropdown/numeric-dropdown";
import useTaskStore from "../../../../store/task-store"; // 경로는 실제 프로젝트에 맞게 조정해주세요.

const DEFAULT_NUMERIC_FIELD_VALUE: NumericField = {
  value: 0,
  unit: "숫자",
  decimalPlaces: 0,
};

const PREVIEW_NUMBER = 1234.56789;

const NumericFieldComponent: React.FC<{ numericField: NumericField | null | undefined, taskId: string }> = ({ numericField, taskId }) => {
  const updateTask = useTaskStore(state => state.updateTask);

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  const [editingUnit, setEditingUnit] = useState<MeasurementUnit>(
    DEFAULT_NUMERIC_FIELD_VALUE.unit
  );
  const [editingDecimalPlaces, setEditingDecimalPlaces] = useState<number>(
    DEFAULT_NUMERIC_FIELD_VALUE.decimalPlaces
  );
  const [editingValueString, setEditingValueString] = useState<string>(
    String(DEFAULT_NUMERIC_FIELD_VALUE.value)
  );

  useEffect(() => {
    if (numericField) {
      setEditingUnit(numericField.unit);
      setEditingDecimalPlaces(numericField.decimalPlaces);
      setEditingValueString(String(numericField.value));
    } else {
      // 새 필드거나, numericField가 null/undefined로 초기화될 때
      setEditingUnit(DEFAULT_NUMERIC_FIELD_VALUE.unit);
      setEditingDecimalPlaces(DEFAULT_NUMERIC_FIELD_VALUE.decimalPlaces);
      setEditingValueString(String(DEFAULT_NUMERIC_FIELD_VALUE.value));
    }
  }, [numericField]);

  const unitList: MeasurementUnit[] = [
    "숫자", "퍼센트", "KRW", "USD", "EUR", "JPY", "CNY", "사용자 지정 테이블", "형식 없음"
  ];
  const decimalList: number[] = [0, 1, 2, 3, 4, 5, 6];
  const editContainerRef = useRef<HTMLDivElement>(null);

  const resetEditingStatesToCurrentField = () => {
    const currentVal = numericField?.value ?? DEFAULT_NUMERIC_FIELD_VALUE.value;
    const currentUnit = numericField?.unit || DEFAULT_NUMERIC_FIELD_VALUE.unit;
    const currentDecimalPlaces = numericField?.decimalPlaces ?? DEFAULT_NUMERIC_FIELD_VALUE.decimalPlaces;

    setEditingValueString(String(currentVal));
    setEditingUnit(currentUnit);
    setEditingDecimalPlaces(currentDecimalPlaces);
  };

  const handleCancel = () => {
    setIsInEditMode(false);
    setIsOpenEdit(false);
    resetEditingStatesToCurrentField();
  };

  const handleToggleEditMode = () => {
    if (isInEditMode) {
      handleCancel();
    } else {
      setIsInEditMode(true);
      setIsOpenEdit(false); // 처음 편집 모드 진입 시 값 수정 UI 부터
      resetEditingStatesToCurrentField();
    }
  };

  useClickOutside(editContainerRef, handleCancel, isInEditMode);

  const handleValueInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setEditingValueString("");
      return;
    }
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    if (numericRegex.test(val)) {
        setEditingValueString(val);
    }
  };

  const handleSave = () => {
    let finalValue: number;
    const parsedValue = parseFloat(editingValueString);

    if (editingValueString.trim() === "" || isNaN(parsedValue)) {
      finalValue = numericField?.value ?? DEFAULT_NUMERIC_FIELD_VALUE.value;
    } else {
      finalValue = parsedValue;
    }
    
    const applyDecimalPlaces = ["숫자", "퍼센트", "사용자 지정 테이블"].includes(editingUnit);

    const updatedNumericField: NumericField = {
      value: finalValue,
      unit: editingUnit,
      decimalPlaces: applyDecimalPlaces ? editingDecimalPlaces : 0,
    };
    updateTask(taskId, { numericField: updatedNumericField });
    setIsInEditMode(false);
    setIsOpenEdit(false);
  };
  
  const CURRENCY_SYMBOL_MAP: Record<string, string> = {
    KRW: "₩", USD: "$", EUR: "€", JPY: "¥", CNY: "¥",
    "숫자": "", "퍼센트": "%",
    "사용자 지정 테이블": "", 
    "형식 없음": "",
  };

  const previewValueFormatted = useMemo(() => {
    let valueStr: string;
    let symbolToDisplay: string = "";

    const applyDecimalPlacesForPreview = ["숫자", "퍼센트", "사용자 지정 테이블"].includes(editingUnit);
    const effectiveDecimalPlaces = applyDecimalPlacesForPreview ? editingDecimalPlaces : 0;

    switch (editingUnit) {
      case "숫자":
        valueStr = PREVIEW_NUMBER.toFixed(effectiveDecimalPlaces);
        break;
      case "퍼센트":
        valueStr = PREVIEW_NUMBER.toFixed(effectiveDecimalPlaces);
        symbolToDisplay = CURRENCY_SYMBOL_MAP[editingUnit] || "%";
        break;
      case "KRW": case "USD": case "EUR": case "JPY": case "CNY":
        valueStr = PREVIEW_NUMBER.toFixed(0); 
        symbolToDisplay = CURRENCY_SYMBOL_MAP[editingUnit] ? ` ${CURRENCY_SYMBOL_MAP[editingUnit]}` : ` ${editingUnit}`;
        break;
      case "형식 없음":
        valueStr = String(PREVIEW_NUMBER);
        break;
      case "사용자 지정 테이블":
        valueStr = PREVIEW_NUMBER.toFixed(effectiveDecimalPlaces);
        symbolToDisplay = " (사용자 지정)";
        break;
      default:
        valueStr = PREVIEW_NUMBER.toFixed(effectiveDecimalPlaces);
        symbolToDisplay = ` ${editingUnit}`;
    }
    return `${valueStr}${symbolToDisplay}`;
  }, [editingUnit, editingDecimalPlaces]);

  const actualNumericField = numericField || DEFAULT_NUMERIC_FIELD_VALUE;
  const displayDecimalPlaces = ["숫자", "퍼센트", "사용자 지정 테이블"].includes(actualNumericField.unit)
    ? actualNumericField.decimalPlaces
    : 0;

  const currentDisplayValueFormatted = actualNumericField.value.toFixed(displayDecimalPlaces);
  const currentDisplayUnitSymbol = CURRENCY_SYMBOL_MAP[actualNumericField.unit] ?? 
                                   (actualNumericField.unit === "사용자 지정 테이블" ? " (사용자 지정)" : "");


  if (!numericField && !isInEditMode) {
    return (
      <li className="task-detail__detail-modal-field-item">
        <FieldLabel fieldName="숫자" onClick={handleToggleEditMode} />
        <ul className="task-detail__detail-modal-field-content-list">
          <li className="task-detail__detail-modal-field-edit-item--no-message">
            표시할 숫자 형식이 없습니다. 클릭하여 추가하세요.
          </li>
        </ul>
      </li>
    );
  }

  if (!numericField && isInEditMode) { // 새 필드 추가 모드
    return (
      <li className="task-detail__detail-modal-field-item">
        <FieldLabel fieldName="숫자" onClick={handleToggleEditMode} />
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          <div className="task-detail__detail-modal-field-edit-list-wrapper">
            <div className="task-detail__detail-modal-field-edit-numeric-options">
              <NumericDropdown
                title="형식"
                currentValue={editingUnit}
                dropdownList={unitList}
                onSelect={(unit) => setEditingUnit(unit)}
              />
              {["숫자", "퍼센트", "사용자 지정 테이블"].includes(editingUnit) && (
                <NumericDropdown
                  title="소수 자릿수"
                  currentValue={editingDecimalPlaces}
                  dropdownList={decimalList}
                  onSelect={(places) => setEditingDecimalPlaces(places)}
                />
              )}
              <div className="task-detail__detail-modal-field-edit-numeric-row task-detail__detail-modal-field-edit-numeric-preview-row">
                <div className="task-detail__detail-modal-field-edit-numeric-label">미리보기</div>
                <div className="task-detail__detail-modal-field-edit-numeric-preview-value">
                  {previewValueFormatted}
                </div>
              </div>
            </div>
            <div className="task-detail__detail-modal-field-edit-separator" />
          </div>
          <FieldFooter
            title="옵션 추가"
            isPlusIcon={true} // "추가" 액션을 나타내는 아이콘
            onClick={handleSave} // 저장 동작
            handleCancel={handleCancel}
            isShowButton={true}
            onSave={handleSave} // FieldFooter가 onSave를 주 저장 핸들러로 사용한다면
          />
        </div>
      </li>
    );
  }
  
  // numericField가 존재할 때의 로직 (보기 모드 또는 편집 모드)
  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel fieldName="숫자" onClick={handleToggleEditMode} />
      
      {/* 보기 모드일 때 표시되는 부분 */}
      {!isInEditMode && numericField && (
        <ul className="task-detail__detail-modal-field-content-list">
          <li className="task-detail__detail-modal-field-item--numeric">
            <div>{currentDisplayValueFormatted}</div>
            {currentDisplayUnitSymbol && <div>{currentDisplayUnitSymbol}</div>}
          </li>
        </ul>
      )}

      {/* 편집 모드일 때 표시되는 부분 */}
      {isInEditMode && numericField && (
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          {isOpenEdit ? ( // 단위/소수점 옵션 편집
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <div className="task-detail__detail-modal-field-edit-numeric-options">
                  <NumericDropdown
                    title="형식"
                    currentValue={editingUnit}
                    dropdownList={unitList}
                    onSelect={(unit) => setEditingUnit(unit)}
                  />
                  {["숫자", "퍼센트", "사용자 지정 테이블"].includes(editingUnit) && (
                    <NumericDropdown
                      title="소수 자릿수"
                      currentValue={editingDecimalPlaces}
                      dropdownList={decimalList}
                      onSelect={(places) => setEditingDecimalPlaces(places)}
                    />
                  )}
                  <div className="task-detail__detail-modal-field-edit-numeric-row task-detail__detail-modal-field-edit-numeric-preview-row">
                    <div className="task-detail__detail-modal-field-edit-numeric-label">미리보기</div>
                    <div className="task-detail__detail-modal-field-edit-numeric-preview-value">
                      {previewValueFormatted}
                    </div>
                  </div>
                </div>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter
                title="저장" // 또는 "옵션 저장"
                isPlusIcon={false} // 일반 저장 버튼
                onClick={handleSave}
                handleCancel={handleCancel} // 옵션 편집 취소 시 값 편집으로 돌아가거나 전체 취소 가능
                isShowButton={true}
                onSave={handleSave}
              />
            </>
          ) : ( // 숫자 값 직접 편집
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editingValueString}
                    onChange={handleValueInputChange}
                    className="task-detail__detail-modal-field-edit-input--numeric-view" // 이 클래스에 스타일 적용
                    placeholder="숫자 입력"
                  />
                  {/* 현재 *편집 중인* 단위의 심볼을 보여주는 것이 더 직관적일 수 있음 */}
                  {/* 또는 저장된 단위(currentDisplayUnitSymbol)를 보여줄 수도 있음 */}
                  {/* 여기서는 일관성을 위해 currentDisplayUnitSymbol 사용 */}
                  {currentDisplayUnitSymbol && <span>{currentDisplayUnitSymbol}</span>}
                </div>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter
                title="옵션 수정" // "옵션 수정" 버튼 클릭 시 isOpenEdit = true
                isPlusIcon={false}
                onClick={() => setIsOpenEdit(true)}
                handleCancel={handleCancel} // 값 입력 단계에서 취소
                isShowButton={true}
                onSave={handleSave}
              />
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default NumericFieldComponent;