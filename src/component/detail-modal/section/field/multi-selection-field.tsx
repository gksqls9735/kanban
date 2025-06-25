import { useEffect, useRef, useState } from "react";
import OptionItem from "../../common/option-item";
import ExpandToggle from "../../common/expand-toggle";
import FieldLabel from "./field-common/field-label";
import OptionList from "./field-common/option/option-list";
import FieldFooter from "./field-common/field-footer";
import { CombinedOptionItem } from "./single-selection";
import { SelectableOption, Task } from "../../../../types/type";
import { useToast } from "../../../../context/toast-context";
import { lightenColor } from "../../../../utils/color-function";
import useClickOutside from "../../../../hooks/use-click-outside";
import { generateUniqueId } from "../../../../utils/text-function";


const MultiSelection: React.FC<{
  options?: SelectableOption[];
  isOwnerOrParticipant: boolean;
  handleChangeAndNotify: (updates: Partial<Task>) => void;
}> = ({ options: initialOptions = [], isOwnerOrParticipant, handleChangeAndNotify }) => {

  const [combinedItems, setCombinedItems] = useState<CombinedOptionItem[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // 표시 로직: initialOptions 기반 (만약 실시간 반영 원하면 combinedItems 기반으로 변경 필요)
  const selectedOptionsFromInitial = initialOptions.filter(option => option.isSelected === true);
  const optionsToShow = isExpanded ? selectedOptionsFromInitial : selectedOptionsFromInitial.slice(0, 3);
  const hiddenCount = selectedOptionsFromInitial.length > 3 && !isExpanded ? selectedOptionsFromInitial.length - 3 : 0;

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  const editContainerRef = useRef<HTMLDivElement>(null);

  const { showToast } = useToast();

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
  }, []);

  const handleCancel = () => {
    setIsInEditMode(false);
    setIsOpenEdit(false);
    const initialCombined: CombinedOptionItem[] = initialOptions.map(option => ({
      code: option.code, name: option.name, colorMain: option.colorMain, colorSub: option.colorSub || lightenColor(option.colorMain, 0.85), isSelected: option.isSelected, isNew: false,
    }));
    setCombinedItems(initialCombined); // 옵션 목록 원복 (만약 옵션 목록 자체를 수정하는 기능이 있다면)
  };

  const handleToggleEditMode = () => {
    if (isInEditMode) { // 편집 모드 종료 시
      handleCancel();
    } else { // 편집 모드 진입 시
      setIsInEditMode(true);
      setIsOpenEdit(false);
    }
  };

  useClickOutside(editContainerRef, handleCancel, isInEditMode);

  const handleSaveOptions = () => {
    const validOptions = combinedItems.filter(item => item.name && item.name.trim() !== '');

    const names = validOptions.map(item => item.name.trim());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      showToast('동일한 이름의 옵션이 존재합니다.');
      return;
    }

    const optionsForNotify: SelectableOption[] = validOptions.map(item => ({
      code: item.code,
      name: item.name.trim(),
      colorMain: item.colorMain,
      colorSub: item.colorSub,
      isSelected: item.isSelected,
    }));
    const optionsForSetState: CombinedOptionItem[] = validOptions.map(item => ({
      code: item.code,
      name: item.name.trim(),
      colorMain: item.colorMain,
      colorSub: item.colorSub,
      isSelected: item.isSelected,
      isNew: false,
    }));

    handleChangeAndNotify({ multiSelection: optionsForNotify });
    setCombinedItems(optionsForSetState);
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
      code: tempCode, name: "", colorMain: '#FFE6EB', colorSub: '#FFEFF2', isSelected: false, isNew: true
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
    if (!isOwnerOrParticipant) return;
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
                      <div onClick={() => handleChangeSelect(option)} style={{ cursor: 'pointer' }}>
                        <OptionItem option={option} />
                      </div>
                    </li>
                  ))}
                  {combinedItems.length === 0 && <li className="task-detail__detail-modal-field-edit-item--no-message">표시할 옵션이 없습니다.</li>}
                </ul>
                {isOwnerOrParticipant && (<div className="task-detail__detail-modal-field-edit-separator" />)}
              </div>
              {isOwnerOrParticipant && (<FieldFooter title="옵션 수정" isPlusIcon={false} onClick={() => setIsOpenEdit(true)} handleCancel={handleCancel} isShowButton={true} onSave={handleSaveOptions} />)}
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default MultiSelection;