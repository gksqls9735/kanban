// NumericFieldComponent.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { MeasurementUnit, NumericField, Task } from "../../../../types/type"; // Adjust path as needed
import FieldLabel from "./field-common/field-label";
import useClickOutside from "../../../../hooks/use-click-outside";
import FieldFooter from "./field-common/field-footer";
import NumericDropdown from "./field-dropdown/numeric-dropdown";
const DEFAULT_NUMERIC_FIELD_VALUE: NumericField = {
  value: 0,
  unit: "숫자",
  decimalPlaces: 0,
};

const PREVIEW_NUMBER = 1234.56789;

const NumericFieldComponent: React.FC<{
  numericField: NumericField | null | undefined, taskId: string, isOwnerOrParticipant: boolean, handleChangeAndNotify: (updates: Partial<Task>) => void
}> = ({ numericField, isOwnerOrParticipant, handleChangeAndNotify }) => {

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
      setIsOpenEdit(false);
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
    handleChangeAndNotify({ numericField: updatedNumericField });
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
      case "숫자": valueStr = PREVIEW_NUMBER.toFixed(effectiveDecimalPlaces); break;
      case "퍼센트":
        valueStr = PREVIEW_NUMBER.toFixed(effectiveDecimalPlaces);
        symbolToDisplay = CURRENCY_SYMBOL_MAP[editingUnit] || "%";
        break;
      case "KRW": case "USD": case "EUR": case "JPY": case "CNY":
        valueStr = PREVIEW_NUMBER.toFixed(0);
        symbolToDisplay = CURRENCY_SYMBOL_MAP[editingUnit] ? ` ${CURRENCY_SYMBOL_MAP[editingUnit]}` : ` ${editingUnit}`;
        break;
      case "형식 없음": valueStr = String(PREVIEW_NUMBER); break;
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


  // Case 1: Not in Edit Mode - Displaying information or placeholder
  if (!isInEditMode) {
    if (!numericField) {
      return (
        <li className="task-detail__detail-modal-field-item">
          <FieldLabel fieldName="숫자" onClick={handleToggleEditMode} />
          <ul className="task-detail__detail-modal-field-content-list">
            <li className="task-detail__detail-modal-field-edit-item--no-message">
              표시할 옵션이 없습니다.
            </li>
          </ul>
        </li>
      );
    }
    return (
      <li className="task-detail__detail-modal-field-item">
        <FieldLabel fieldName="숫자" onClick={handleToggleEditMode} />
        <ul className="task-detail__detail-modal-field-content-list">
          <li className="task-detail__detail-modal-field-item--numeric">
            <div>{currentDisplayValueFormatted}</div>
            {currentDisplayUnitSymbol && <div>{currentDisplayUnitSymbol}</div>}
          </li>
        </ul>
      </li>
    );
  }

  // Case 2: In Edit Mode
  const numericOptionsEditorUI = (
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
  );

  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel fieldName="숫자" onClick={handleToggleEditMode} />
      {numericField ? (
        <ul className="task-detail__detail-modal-field-content-list">
          <li className="task-detail__detail-modal-field-item--numeric">
            <div>{currentDisplayValueFormatted}</div>
            {currentDisplayUnitSymbol && <div>{currentDisplayUnitSymbol}</div>}
          </li>
        </ul>
      ) : (
        <ul className="task-detail__detail-modal-field-content-list">
          <li className="task-detail__detail-modal-field-edit-item--no-message">
            표시할 옵션이 없습니다.
          </li>
        </ul>
      )}
      <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
        {!numericField ? (
          // Case 2a: In Edit Mode - NO existing numericField (Creating new)
          <>
            {!isOpenEdit ? (
              // Initial state for new field: prompt to define format
              <>
                <div className="task-detail__detail-modal-field-edit-list-wrapper">
                  <div className="task-detail__detail-modal-field-edit-item--no-message">
                    표시할 옵션이 없습니다.
                  </div>
                  {isOwnerOrParticipant && <div className="task-detail__detail-modal-field-edit-separator" />}
                </div>
                {isOwnerOrParticipant && (
                  <FieldFooter
                    title="옵션 추가"
                    isPlusIcon={false}
                    onClick={() => setIsOpenEdit(true)}
                    handleCancel={handleCancel}
                    isShowButton={true}
                  />
                )}
              </>
            ) : (
              // isOpenEdit is true: Show format definition UI for new field
              <>
                <div className="task-detail__detail-modal-field-edit-list-wrapper">
                  {numericOptionsEditorUI}
                  <div className="task-detail__detail-modal-field-edit-separator" />
                </div>
                <FieldFooter
                  title="옵션 추가"
                  isPlusIcon={true}
                  onClick={handleSave}
                  handleCancel={handleCancel} // Full cancel from this state
                  isShowButton={true}
                  onSave={handleSave}
                />
              </>
            )}
          </>
        ) : (
          // Case 2b: In Edit Mode - existing numericField
          <>
            {isOpenEdit ? (
              // Editing options (unit, decimal places) for existing field
              <>
                <div className="task-detail__detail-modal-field-edit-list-wrapper">
                  {numericOptionsEditorUI}
                  <div className="task-detail__detail-modal-field-edit-separator" />
                </div>
                <FieldFooter
                  title="옵션 저장"
                  isPlusIcon={false}
                  onClick={handleSave}
                  handleCancel={() => {
                    setIsOpenEdit(false);
                    resetEditingStatesToCurrentField();
                  }}
                  isShowButton={true}
                  onSave={handleSave}
                />
              </>
            ) : (
              // Editing value for existing field
              <>
                <div className="task-detail__detail-modal-field-edit-list-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="task-detail__detail-modal-field-edit-numeric-view-input-wrapper">
                    <input
                      type="text"
                      value={editingValueString}
                      onChange={handleValueInputChange}
                      placeholder="숫자 입력"
                      disabled={!isOwnerOrParticipant}
                    />
                    {currentDisplayUnitSymbol && <div>&nbsp;{currentDisplayUnitSymbol}</div>}
                  </div>
                  {isOwnerOrParticipant && <div className="task-detail__detail-modal-field-edit-separator" />}
                </div>
                {isOwnerOrParticipant && (
                  <FieldFooter
                    title="옵션 수정"
                    isPlusIcon={false}
                    onClick={() => setIsOpenEdit(true)}
                    handleCancel={handleCancel}
                    isShowButton={true}
                    onSave={handleSave}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </li>
  );
};

export default NumericFieldComponent;