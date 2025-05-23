import { useEffect, useRef, useState } from "react";
import { SelectableOption } from "../../../../types/type";
import OptionItem from "../../common/option-item";
import ExpandToggle from "../../common/expand-toggle";
import FieldLabel from "./field-common/field-label";
import useClickOutside from "../../../../hooks/use-click-outside";
import { lightenColor } from "../../../../utils/color-function";
import FieldFooter from "./field-common/field-footer";
import useTaskStore from "../../../../store/task-store";
import { CombinedOptionItem } from "./single-selection";
import { generateUniqueId } from "../../../../utils/text-function";
import OptionList from "./field-common/option/option-list";

const MultiSelection: React.FC<{
  options?: SelectableOption[];
  taskId: string;
}> = ({ options: initialOptions = [], taskId }) => {
  const updateTask = useTaskStore(state => state.updateTask);

  const [combinedItems, setCombinedItems] = useState<CombinedOptionItem[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // 표시 로직: initialOptions 기반 (만약 실시간 반영 원하면 combinedItems 기반으로 변경 필요)
  const selectedOptionsFromInitial = initialOptions.filter(option => option.isSelected === true);
  const optionsToShow = isExpanded ? selectedOptionsFromInitial : selectedOptionsFromInitial.slice(0, 3);
  const hiddenCount = selectedOptionsFromInitial.length > 3 && !isExpanded ? selectedOptionsFromInitial.length - 3 : 0;

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialCombined: CombinedOptionItem[] = initialOptions.map(option => ({
      code: option.code,
      name: option.name,
      colorMain: option.colorMain,
      colorSub: option.colorSub || lightenColor(option.colorMain, 0.85),
      isSelected: option.isSelected || false,
      isNew: false,
    }));
    setCombinedItems(initialCombined);
  }, []); // 마운트 시에만 initialOptions로 combinedItems 초기화

  const handleCancel = () => {
    setIsInEditMode(false);
    setIsOpenEdit(false);
    // 여기에서 initialOptions 기준으로 combinedItems를 리셋하는 로직을 일단 주석 처리합니다.
    // 이렇게 하면 사용자가 '저장'하기 전까지 로컬 변경(isSelected 토글)이 유지됩니다.
    // 만약 '취소' 시 명시적으로 초기 상태로 되돌리려면 이 주석을 해제하고,
    // initialOptions가 마지막 저장 상태를 반영하도록 해야 합니다.
    /*
    const restoredCombined: CombinedOptionItem[] = initialOptions.map(option => ({
        code: option.code, name: option.name, colorMain: option.colorMain, colorSub: option.colorSub || lightenColor(option.colorMain, 0.85), isSelected: option.isSelected || false, isNew: false,
    }));
    setCombinedItems(restoredCombined);
    */
  };

  const handleToggleEditMode = () => {
    if (isInEditMode) { // 편집 모드 종료 시
      handleCancel();
    } else { // 편집 모드 진입 시
      setIsInEditMode(true);
      setIsOpenEdit(false);
      // 편집 모드 진입 시 combinedItems를 initialOptions로 리셋하는 로직도 일단 주석 처리합니다.
      // useEffect가 이미 초기 설정을 담당했으므로, 여기서 리셋하면 이전 로컬 변경이 사라집니다.
      // 만약 편집 모드 진입 시 항상 initialOptions 기준으로 새로고침해야 한다면 이 주석을 해제합니다.
      /*
      const currentCombined: CombinedOptionItem[] = initialOptions.map(option => ({
        code: option.code, name: option.name, colorMain: option.colorMain, colorSub: option.colorSub || lightenColor(option.colorMain, 0.85), isSelected: option.isSelected || false, isNew: false,
      }));
      setCombinedItems(currentCombined);
      */
    }
  };

  useClickOutside(editContainerRef, handleCancel, isInEditMode);

  const handleSaveOptions = () => {
    const validOptionsToSave = combinedItems
      .filter(item => item.name && item.name.trim() !== '')
      .map(item => ({
        code: item.code,
        name: item.name,
        colorMain: item.colorMain,
        colorSub: item.colorSub,
        isSelected: item.isSelected,
      }));
    updateTask(taskId, { multiSelection: validOptionsToSave });
    if (isOpenEdit) {
      setIsOpenEdit(false);
    } else {
      setIsInEditMode(false);
      setIsOpenEdit(false);
    }
  };

  const handleDeleteOption = (code: string) => {
    setCombinedItems(prev => prev.filter(item => item.code !== code));
  };

  const handleAddNewForm = () => {
    const tempCode = generateUniqueId('new-option');
    const newFormItem: CombinedOptionItem = {
      code: tempCode, name: "", colorMain: '#FFE6EB', colorSub: '#FFEFF2', isSelected: false,
    };
    setCombinedItems(prev => [...prev, newFormItem]);
  };

  const handleUpdateOption = (code: string, field: string, value: string) => {
    setCombinedItems(prev =>
      prev.map(item => (item.code === code ? { ...item, [field]: value } : item))
    );
  };

  const handleUpdateColor = (code: string, colorMain: string, colorSub: string) => {
    setCombinedItems(prev =>
      prev.map(item => (item.code === code ? { ...item, colorMain, colorSub } : item))
    );
  };

  const handleOrderChange = (newOrderedItems: CombinedOptionItem[]) => {
    setCombinedItems(newOrderedItems);
  };

  const handleChangeSelect = (clickedOption: CombinedOptionItem) => {
    setCombinedItems(prevItems =>
      prevItems.map(item =>
        item.code === clickedOption.code
          ? { ...item, isSelected: !item.isSelected } // 여기서 item은 prevItems의 각 항목입니다.
          : item
      )
    );
  };

  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel fieldName="다중선택" onClick={handleToggleEditMode} />
      <ul className="task-detail__detail-modal-field-content-list">
        {optionsToShow.map(option => (
          <OptionItem key={option.code} option={option} />
        ))}
        {optionsToShow.length === 0 && <li className="task-detail__detail-modal-field-edit-item--no-message">표시할 옵션이 없습니다.</li>}
        <ExpandToggle hiddenCount={hiddenCount} toggle={() => setIsExpanded(prev => !prev)} isExpanded={isExpanded} />
      </ul>
      {isInEditMode && (
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          {isOpenEdit ? (
            <>
              {/* ... OptionList 및 옵션 추가/저장 UI ... */}
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <OptionList options={combinedItems} onUpdate={handleUpdateOption} onDelete={handleDeleteOption} onColorUpdate={handleUpdateColor} onOrderChange={handleOrderChange} />
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="옵션 추가" isPlusIcon={true} onClick={handleAddNewForm} handleCancel={handleCancel} isShowButton={true} onSave={handleSaveOptions} />
            </>
          ) : (
            <>
              {/* 체크박스 리스트 (isOpenEdit이 false일 때) */}
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
                  {combinedItems.map(option => (
                    <li key={option.code} className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--selection-view">
                      <div className="participant-modal__checkbox-area" style={{ alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          className="participant-modal__checkbox--native"
                          id={`checkbox-${option.code}`} // 고유 ID 추가 (optional but good practice)
                          onChange={() => handleChangeSelect(option)}
                          checked={option.isSelected}
                        />
                        <label htmlFor={`checkbox-${option.code}`} className="participant-modal__checkbox--visual" />
                      </div>
                      <div onClick={() => handleChangeSelect(option)} style={{cursor: 'pointer'}}>
                      <OptionItem option={option} />
                      </div>
                    </li>
                  ))}
                  {combinedItems.length === 0 && <li className="task-detail__detail-modal-field-edit-item--no-message">표시할 옵션이 없습니다.</li>}
                </ul>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="옵션 수정" isPlusIcon={false} onClick={() => setIsOpenEdit(true)} isShowButton={true} onSave={handleSaveOptions} />
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default MultiSelection;