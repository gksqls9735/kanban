import { useEffect, useRef, useState } from "react";
import OptionItem from "../../common/option-item";
import FieldLabel from "./field-common/field-label";
import FieldFooter from "./field-common/field-footer";
import OptionList from "./field-common/option/option-list";
import { SelectableOption, Task } from "../../../../types/type";
import { useToast } from "../../../../context/toast-context";
import { lightenColor } from "../../../../utils/color-function";
import useClickOutside from "../../../../hooks/use-click-outside";
import { generateUniqueId, normalizeSpaces } from "../../../../utils/text-function";

export interface CombinedOptionItem {
  code: string;
  name: string;
  colorMain: string;
  colorSub: string;
  isSelected: boolean;
  isNew: boolean;
}

const SingleSelection: React.FC<{
  options?: SelectableOption[], isOwnerOrParticipant: boolean, handleChangeAndNotify: (updates: Partial<Task>) => void
}> = ({ options: initialOptions = [], isOwnerOrParticipant, handleChangeAndNotify }) => {

  // initialOptions가 비어있거나 isSelected인 항목이 없을 경우 null로 초기화
  const getInitialSelectedOption = (options: SelectableOption[]): SelectableOption | null => {
    return options.find(option => option.isSelected) || null;
  };

  const [persistedOption, setPersistedOption] = useState<SelectableOption | null>(() => {
    const initialSelected = getInitialSelectedOption(initialOptions);
    return initialSelected ? { ...initialSelected, name: normalizeSpaces(initialSelected.name) } : null;
  });

  const [currentOption, setCurrentOption] = useState<SelectableOption | null>(() => {
    const initialSelected = getInitialSelectedOption(initialOptions);
    return initialSelected ? { ...initialSelected, name: normalizeSpaces(initialSelected.name) } : null;
  });

  const [combinedItems, setCombinedItems] = useState<CombinedOptionItem[]>([]);

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  const editContainerRef = useRef<HTMLDivElement>(null);

  const { showToast } = useToast();

  useEffect(() => {
    const newlyPersistedSelected = getInitialSelectedOption(initialOptions);
    setPersistedOption(newlyPersistedSelected ? { ...newlyPersistedSelected, name: normalizeSpaces(newlyPersistedSelected.name) } : null);
    setCurrentOption(newlyPersistedSelected ? { ...newlyPersistedSelected, name: normalizeSpaces(newlyPersistedSelected.name) } : null);

    const initialCombined: CombinedOptionItem[] = initialOptions.map(option => ({
      code: option.code,
      name: normalizeSpaces(option.name),
      colorMain: option.colorMain,
      colorSub: option.colorSub || lightenColor(option.colorMain, 0.85),
      isSelected: option.isSelected,
      isNew: false
    }));

    setCombinedItems(initialCombined);
  }, [initialOptions]);

  const handleCancel = () => {
    setIsInEditMode(false);
    setIsOpenEdit(false);
    const initialCombined: CombinedOptionItem[] = initialOptions.map(option => ({
      code: option.code,
      name: normalizeSpaces(option.name),
      colorMain: option.colorMain,
      colorSub: option.colorSub || lightenColor(option.colorMain, 0.85),
      isSelected: option.isSelected,
      isNew: false
    }));
    setCombinedItems(initialCombined); // 옵션 목록 원복 (만약 옵션 목록 자체를 수정하는 기능이 있다면)
    setCurrentOption(persistedOption); // 현재 선택된 옵션을 저장된 옵션으로 원복
  };

  const handleToggleEditMode = () => {
    if (isInEditMode) {
      handleCancel();
    } else {
      setCurrentOption(persistedOption); // 편집 모드 진입 시, 현재 선택 상태를 저장된 상태로 설정

      const initialCombined: CombinedOptionItem[] = initialOptions.map(option => ({
        code: option.code,
        name: normalizeSpaces(option.name),
        colorMain: option.colorMain,
        colorSub: option.colorSub || lightenColor(option.colorMain, 0.85),
        isSelected: option.isSelected,
        isNew: false,
      }));
      setCombinedItems(initialCombined); // 편집 모드 진입 시, 옵션 목록을 초기 상태로 설정
      setIsInEditMode(true);
      setIsOpenEdit(false);
    }
  };

  useClickOutside(editContainerRef, handleCancel, isInEditMode);

  const handleOption = (option: SelectableOption) => {
    if (!isOwnerOrParticipant) return;
    setCurrentOption(option ? { ...option, name: normalizeSpaces(option.name) } : null);
  };

  const handleSaveOptionSelect = () => {
    // currentOption이 null이 아닐 때만 저장 로직 실행
    if (currentOption) {
      const updatedOptions = combinedItems.map(opt => ({
        ...opt,
        isSelected: opt.code === currentOption.code,
      }));
      handleChangeAndNotify({ singleSelection: updatedOptions }); // `singleSelection` 필드명 확인 필요

      setPersistedOption(currentOption);
      setCombinedItems(updatedOptions); // 반영된 옵션 목록으로 업데이트

      setIsInEditMode(false);
      setIsOpenEdit(false);
    } else {
      // 선택된 옵션이 없는 경우 (예: 모든 옵션의 isSelected가 false가 되도록 저장하고 싶을 때)
      // 이 경우, currentOption이 null일 수 있으므로, isSelected를 모두 false로 설정하는 로직 추가 가능
      const deselectedOptions = combinedItems.map(opt => ({
        ...opt,
        isSelected: false,
      }));
      handleChangeAndNotify({ singleSelection: deselectedOptions });
      setPersistedOption(null);
      setCombinedItems(deselectedOptions);
      setIsInEditMode(false);
      setIsOpenEdit(false);
    }
  };

  const handleSaveOptions = () => {
    const names = combinedItems.map(item => normalizeSpaces(item.name));
    const validOptions = combinedItems.filter((item, index) => {
      const normalizedName = names[index];
      return normalizedName && normalizedName !== '';
    });

    const uniqueNames = new Set(names.filter(name => name !== ''));
    if (validOptions.length > 0 && names.filter(name => name !== '').length !== uniqueNames.size) {
      showToast('동일한 이름의 옵션이 존재합니다.');
      return;
    }

    const optionsToSave = validOptions.map(item => ({
      code: item.code,
      name: normalizeSpaces(item.name),
      colorMain: item.colorMain,
      colorSub: item.colorSub,
      isSelected: item.isSelected,
    }));

    handleChangeAndNotify({ singleSelection: optionsToSave });
    if (isOpenEdit) {
      setIsOpenEdit(false);
    } else {
      setIsInEditMode(false);
      setIsOpenEdit(false);
    }
  };

  const handleDeleteOption = (code: string) => {
    setCombinedItems(prev =>
      prev.filter(item => item.code !== code)
    );
  };

  const handleAddNewForm = () => {
    const tempCode = generateUniqueId('new-option');
    const newFormItem: CombinedOptionItem = {
      code: tempCode, name: "", colorMain: '#FFE6EB', colorSub: '#FFEFF2', isSelected: false, isNew: true,
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

  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel fieldName="단일선택" onClick={handleToggleEditMode} />
      <div className="task-detail__detail-modal-field-content-list">
        {persistedOption ? (
          <OptionItem option={persistedOption} />
        ) : (
          <div className="task-detail__detail-modal-field-edit-item--no-message">
            표시할 옵션이 없습니다.
          </div>
        )}
      </div>
      {isInEditMode && (
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          {isOpenEdit ? ( // 이 부분은 옵션 자체를 관리(추가/삭제/이름변경 등)하는 UI로 보입니다.
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <OptionList options={combinedItems} onUpdate={handleUpdateOption} onDelete={handleDeleteOption} onColorUpdate={handleUpdateColor} onOrderChange={handleOrderChange} />
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="옵션 추가" isPlusIcon={true} onClick={handleAddNewForm} handleCancel={handleCancel} isShowButton={true} onSave={handleSaveOptions} />
            </>
          ) : (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
                  {combinedItems.length > 0 ? (
                    combinedItems.map(option => (
                      <li key={option.code} className="task-detail__detail-modal-field-edit-item" onClick={() => handleOption(option)}>
                        <div className="radio-icon-container">
                          <div className={`radio-icon-outer ${currentOption?.code === option.code ? 'radio-icon-outer--checked' : ''}`}>
                            {currentOption?.code === option.code && (
                              <div className="radio-icon-inner radio-icon-inner--checked" />
                            )}
                          </div>
                        </div>
                        <OptionItem option={option} />
                      </li>
                    ))
                  ) : (
                    <li className="task-detail__detail-modal-field-edit-item--no-message">
                      선택할 수 있는 옵션이 없습니다.
                    </li>
                  )}
                </ul>
                {isOwnerOrParticipant && (<div className="task-detail__detail-modal-field-edit-separator" />)}
              </div>
              {isOwnerOrParticipant && (<FieldFooter title="옵션 목록" isPlusIcon={false} onClick={() => setIsOpenEdit(true)} handleCancel={handleCancel} isShowButton={true} onSave={handleSaveOptionSelect} />)}
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default SingleSelection;