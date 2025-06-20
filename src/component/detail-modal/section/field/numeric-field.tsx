import { useEffect, useMemo, useRef, useState } from "react";
import FieldLabel from "./field-common/field-label";
import NumericDropdown from "./field-dropdown/numeric-dropdown";
import FieldFooter from "./field-common/field-footer";
import { MeasurementUnit, NumericField, Task } from "../../../../types/type";
import useClickOutside from "../../../../hooks/use-click-outside";

const DEFAULT_NUMERIC_FIELD_VALUE: NumericField = {
  value: 0,
  unit: "숫자",
  decimalPlaces: 0,
  customLabel: "",
  labelPosition: "right",
};

const PREVIEW_NUMBER = 1234.56789;

const NumericFieldComponent: React.FC<{
  numericField: NumericField | null | undefined,
  taskId: string, // taskId는 현재 코드에서 직접 사용되지 않지만 prop으로 유지
  isOwnerOrParticipant: boolean,
  handleChangeAndNotify: (updates: Partial<Task>) => void
}> = ({ numericField, isOwnerOrParticipant, handleChangeAndNotify }) => {

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false); // 옵션(형식, 소수점 등) 수정 UI 표시 여부

  const [editingUnit, setEditingUnit] = useState<MeasurementUnit>(
    DEFAULT_NUMERIC_FIELD_VALUE.unit
  );
  const [editingDecimalPlaces, setEditingDecimalPlaces] = useState<number>(
    DEFAULT_NUMERIC_FIELD_VALUE.decimalPlaces
  );
  const [editingValueString, setEditingValueString] = useState<string>(
    String(DEFAULT_NUMERIC_FIELD_VALUE.value)
  );
  // 사용자 지정 레이블 및 위치 상태 추가
  const [editingCustomLabel, setEditingCustomLabel] = useState<string>(
    DEFAULT_NUMERIC_FIELD_VALUE.customLabel || ""
  );
  const [editingLabelPosition, setEditingLabelPosition] = useState<'left' | 'right'>(
    DEFAULT_NUMERIC_FIELD_VALUE.labelPosition || "right"
  );

  useEffect(() => {
    if (numericField) {
      setEditingUnit(numericField.unit);
      setEditingDecimalPlaces(numericField.decimalPlaces);
      setEditingValueString(String(numericField.value));
      setEditingCustomLabel(numericField.customLabel || "");
      setEditingLabelPosition(numericField.labelPosition || "right");
    } else {
      setEditingUnit(DEFAULT_NUMERIC_FIELD_VALUE.unit);
      setEditingDecimalPlaces(DEFAULT_NUMERIC_FIELD_VALUE.decimalPlaces);
      setEditingValueString(String(DEFAULT_NUMERIC_FIELD_VALUE.value));
      setEditingCustomLabel(DEFAULT_NUMERIC_FIELD_VALUE.customLabel || "");
      setEditingLabelPosition(DEFAULT_NUMERIC_FIELD_VALUE.labelPosition || "right");
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
    const currentCustomLabel = numericField?.customLabel || DEFAULT_NUMERIC_FIELD_VALUE.customLabel || "";
    const currentLabelPosition = numericField?.labelPosition || DEFAULT_NUMERIC_FIELD_VALUE.labelPosition || "right";

    setEditingValueString(String(currentVal));
    setEditingUnit(currentUnit);
    setEditingDecimalPlaces(currentDecimalPlaces);
    setEditingCustomLabel(currentCustomLabel);
    setEditingLabelPosition(currentLabelPosition);
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
      setIsOpenEdit(false); // 값 수정 모드로 먼저 진입
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
    // 소수점 하나만 허용, 숫자만 입력 가능
    const numericRegex = /^-?[0-9]*\.?[0-9]*$/;
    if (numericRegex.test(val)) {
      setEditingValueString(val);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleSave = () => {
    let finalValue: number;
    const parsedValue = parseFloat(editingValueString);

    if (editingValueString.trim() === "" || isNaN(parsedValue)) {
      // 입력값이 비어있거나 숫자가 아니면 기존 값 또는 기본값 사용
      finalValue = numericField?.value ?? DEFAULT_NUMERIC_FIELD_VALUE.value;
    } else {
      finalValue = parsedValue;
    }

    const applyDecimalPlaces = ["숫자", "퍼센트", "사용자 지정 테이블"].includes(editingUnit);

    const updatedNumericField: NumericField = {
      value: finalValue,
      unit: editingUnit,
      decimalPlaces: applyDecimalPlaces ? editingDecimalPlaces : 0,
      customLabel: editingUnit === "사용자 지정 테이블" ? editingCustomLabel : undefined,
      labelPosition: editingUnit === "사용자 지정 테이블" ? editingLabelPosition : undefined,
    };
    handleChangeAndNotify({ numericField: updatedNumericField });
    setIsInEditMode(false);
    setIsOpenEdit(false);
  };

  const CURRENCY_SYMBOL_MAP: Record<string, string> = {
    KRW: "₩", USD: "$", EUR: "€", JPY: "¥", CNY: "¥",
    "퍼센트": "%",
    // "숫자", "형식 없음", "사용자 지정 테이블"은 심볼을 여기서 관리하지 않음
  };

  const previewValueFormatted = useMemo(() => {
    let valueStr: string;
    const applyDecimalPlacesForPreview = ["숫자", "퍼센트", "사용자 지정 테이블"].includes(editingUnit);
    const effectiveDecimalPlaces = applyDecimalPlacesForPreview ? editingDecimalPlaces : 0;

    switch (editingUnit) {
      case "숫자":
        return PREVIEW_NUMBER.toFixed(effectiveDecimalPlaces);
      case "퍼센트":
        valueStr = PREVIEW_NUMBER.toFixed(effectiveDecimalPlaces);
        return `${valueStr}${CURRENCY_SYMBOL_MAP[editingUnit] || "%"}`;
      case "KRW": case "USD": case "EUR": case "JPY": case "CNY":
        valueStr = PREVIEW_NUMBER.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }); // 통화 형식, 소수점 없음
        return `${CURRENCY_SYMBOL_MAP[editingUnit] || editingUnit} ${valueStr}`; // 심볼 우선
      case "형식 없음":
        return String(PREVIEW_NUMBER);
      case "사용자 지정 테이블":
        valueStr = PREVIEW_NUMBER.toFixed(effectiveDecimalPlaces);
        if (editingCustomLabel) {
          return editingLabelPosition === 'left'
            ? `${editingCustomLabel} ${valueStr}`
            : `${valueStr} ${editingCustomLabel}`;
        }
        return `${valueStr} (레이블 없음)`;
      default:
        valueStr = PREVIEW_NUMBER.toFixed(effectiveDecimalPlaces);
        return `${valueStr} ${editingUnit}`;
    }
  }, [editingUnit, editingDecimalPlaces, editingCustomLabel, editingLabelPosition]);

  const {
    displayValue,
    displaySymbol,
    isCustomLabelBeforeValue,
  } = useMemo(() => {
    const field = numericField || DEFAULT_NUMERIC_FIELD_VALUE;
    const { value, unit, decimalPlaces, customLabel, labelPosition } = field;

    const effectiveDp = ["숫자", "퍼센트", "사용자 지정 테이블"].includes(unit) ? decimalPlaces : 0;

    // toLocaleString으로 천단위 구분 기호 추가 및 소수 자릿수 처리
    const valStr = value.toLocaleString(undefined, {
      minimumFractionDigits: effectiveDp,
      maximumFractionDigits: effectiveDp,
    });

    if (unit === "사용자 지정 테이블") {
      if (customLabel) {
        return {
          displayValue: valStr,
          displaySymbol: customLabel,
          isCustomLabelBeforeValue: labelPosition === 'left',
        };
      }
      return { displayValue: valStr, displaySymbol: null, isCustomLabelBeforeValue: false };
    }

    let symbol: string | null = CURRENCY_SYMBOL_MAP[unit] || null;
    // "숫자", "형식 없음"은 심볼 없음
    if (unit === "숫자" || unit === "형식 없음") symbol = null;

    // 통화 기호는 값 앞에 오는 경우가 많으므로 (예: $1,234), 이를 위한 플래그 추가 가능
    // 여기서는 간단히 뒤에 붙이는 것으로 통일하거나, CURRENCY_SYMBOL_MAP 수정
    const isCurrencySymbolBefore = ["USD", "EUR", "JPY", "CNY"].includes(unit); // KRW는 보통 뒤

    return {
      displayValue: valStr,
      displaySymbol: symbol,
      isCustomLabelBeforeValue: isCurrencySymbolBefore && unit !== "KRW" // 사용자 정의 레이블 위치와 다른 개념
    };
  }, [numericField]);


  const symbolForInputEditing = useMemo(() => {
    const unitToUse = numericField?.unit || DEFAULT_NUMERIC_FIELD_VALUE.unit;
    if (["숫자", "형식 없음", "사용자 지정 테이블"].includes(unitToUse)) {
      return null;
    }
    return CURRENCY_SYMBOL_MAP[unitToUse] || unitToUse;
  }, [numericField]);


  // Case 1: Not in Edit Mode - Displaying information or placeholder
  if (!isInEditMode) {
    if (!numericField) {
      return (
        <li className="task-detail__detail-modal-field-item">
          <FieldLabel fieldName="숫자" onClick={isOwnerOrParticipant ? handleToggleEditMode : () => { }} />
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
        <FieldLabel fieldName="숫자" onClick={isOwnerOrParticipant ? handleToggleEditMode : () => { }} />
        <ul className="task-detail__detail-modal-field-content-list">
          <li className="task-detail__detail-modal-field-item--numeric">
            {isCustomLabelBeforeValue && displaySymbol && <div className="numeric-field__symbol numeric-field__symbol--before">{displaySymbol}</div>}
            <div className="numeric-field__value">{displayValue}</div>
            {!isCustomLabelBeforeValue && displaySymbol && <div className="numeric-field__symbol numeric-field__symbol--after">{displaySymbol}</div>}
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
        onSelect={(unit) => setEditingUnit(unit as MeasurementUnit)} // 타입 캐스팅
      />
      {["숫자", "퍼센트", "사용자 지정 테이블"].includes(editingUnit) && (
        <NumericDropdown
          title="소수 자릿수"
          currentValue={editingDecimalPlaces}
          dropdownList={decimalList}
          onSelect={(places) => setEditingDecimalPlaces(places as number)} // 타입 캐스팅
        />
      )}
      {editingUnit === "사용자 지정 테이블" && (
        <>
          <NumericDropdown
            title="레이블 입력"
            currentValue="" // 이 prop은 사용되지 않음
            dropdownList={[]} // 이 prop은 사용되지 않음
            onSelect={() => { }} // 이 prop은 사용되지 않음
            customInputValue={editingCustomLabel}
            onCustomInputChange={setEditingCustomLabel}
          />
          <NumericDropdown
            title="위치"
            currentValue="" // 이 prop은 사용되지 않음
            dropdownList={[]} // 이 prop은 사용되지 않음
            onSelect={() => { }} // 이 prop은 사용되지 않음
            labelPositionValue={editingLabelPosition}
            onLabelPositionChange={setEditingLabelPosition}
          />
        </>
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
      <FieldLabel fieldName="숫자" onClick={isOwnerOrParticipant ? handleToggleEditMode : () => { }} />
      {/* 편집 모드 진입 시 항상 편집 UI가 보이도록 수정 */}
      {/* 기존 값 표시는 제거하고, 편집 UI만 표시하거나, 아니면 편집 UI가 열렸을때만 표시 */}
      {/* 여기서는 isInEditMode가 true일 때 항상 editContainerRef 내부가 보이도록 함 */}

      <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
        {!numericField && !isOpenEdit && !isOwnerOrParticipant && (
          <ul className="task-detail__detail-modal-field-content-list">
            <li className="task-detail__detail-modal-field-edit-item--no-message">
              표시할 옵션이 없습니다.
            </li>
          </ul>
        )}

        {/* Case: No existing numericField (Creating new) OR Editing existing */}
        {(!numericField && !isOpenEdit && isOwnerOrParticipant) && (
          // 초기 상태: "옵션 추가" 버튼 (numericField 없고, 옵션 편집창 안 열렸을 때)
          <>
            <div className="task-detail__detail-modal-field-edit-list-wrapper">
              <div className="task-detail__detail-modal-field-edit-item--no-message">
                표시할 옵션이 없습니다.
              </div>
              {isOwnerOrParticipant && <div className="task-detail__detail-modal-field-edit-separator" />}
            </div>
            {isOwnerOrParticipant && (
              <FieldFooter
                title="옵션 추가" // numericField가 없으므로 '옵션 추가'
                isPlusIcon={false} // 최초에는 + 아이콘이 아님
                onClick={() => {
                  resetEditingStatesToCurrentField(); // 기본값으로 설정
                  setIsOpenEdit(true);
                }}
                handleCancel={handleCancel} // 전체 편집 모드 취소
                isShowButton={true}
              />
            )}
          </>
        )}

        {isOpenEdit && (
          // 옵션 편집 UI (형식, 소수점, 레이블 등)
          <>
            <div className="task-detail__detail-modal-field-edit-list-wrapper">
              {numericOptionsEditorUI}
              {isOwnerOrParticipant && <div className="task-detail__detail-modal-field-edit-separator" />}
            </div>
            {isOwnerOrParticipant && (
              <FieldFooter
                title={numericField ? "옵션 저장" : "옵션 추가"} // 상황에 맞는 버튼 텍스트
                isPlusIcon={!numericField} // 새 필드면 +, 기존 필드면 저장 아이콘 (CSS로 처리 필요)
                onClick={handleSave} // 옵션 저장
                handleCancel={() => { // 옵션 편집만 취소, 값 입력 모드로 돌아가거나 전체 취소
                  if (numericField) {
                    setIsOpenEdit(false);
                    resetEditingStatesToCurrentField(); // 이전 상태로 복원
                  } else {
                    handleCancel(); // 새 필드 추가 중 옵션 설정 취소 시 전체 취소
                  }
                }}
                isShowButton={true}
                onSave={handleSave}
              />
            )}
          </>
        )}

        {!isOpenEdit && numericField && (
          // 값 편집 UI (기존 필드가 있고, 옵션 편집창이 닫혔을 때)
          <>
            <div className="task-detail__detail-modal-field-edit-list-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
              <div className="task-detail__detail-modal-field-edit-numeric-view-input-wrapper">
                <input
                  type="text" // Firefox 등에서 number 타입의 스타일링 이슈 및 소수점 입력 편의를 위해 text 사용
                  value={editingValueString}
                  onChange={handleValueInputChange}
                  onKeyDown={handleInputKeyDown}
                  placeholder="숫자 입력"
                  disabled={!isOwnerOrParticipant}
                  className="numeric-field__input"
                />
                {symbolForInputEditing && <div className="numeric-field__input-symbol">&nbsp;{symbolForInputEditing}</div>}
              </div>
              {isOwnerOrParticipant && <div className="task-detail__detail-modal-field-edit-separator" />}
            </div>
            {isOwnerOrParticipant && (
              <FieldFooter
                title="옵션 수정"
                isPlusIcon={false}
                onClick={() => setIsOpenEdit(true)} // 옵션 편집 UI 열기
                handleCancel={handleCancel} // 전체 편집 모드 취소
                isShowButton={true}
                onSave={handleSave} // 값 저장
              />
            )}
          </>
        )}
      </div>
    </li>
  );
};

export default NumericFieldComponent;