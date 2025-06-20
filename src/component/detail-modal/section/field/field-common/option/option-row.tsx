import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SelectionCheckBox from "../selection-checkbox";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from "@dnd-kit/sortable";
import SelectionDropdown from "../../field-dropdown/selection-dropdown";
import { CombinedOptionItem } from "../../single-selection";

const OptionRow: React.FC<{
  option: CombinedOptionItem,
  onUpdate: (code: string, field: string, value: string) => void;
  onDelete: (code: string) => void;
  onColorUpdate: (code: string, colorMain: string, colorSub: string) => void;
  onOrderChange: (newOrderedItems: CombinedOptionItem[]) => void;
  autoFocus: boolean;
}> = ({ option, onUpdate, onDelete, onColorUpdate, autoFocus }) => {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging
  } = useSortable({ id: option.code })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--option"
    >
      <div
        {...attributes}
        {...listeners}
        style={{ cursor: `${isDragging ? 'grabbing' : 'grab'}` }}
        className="task-detail__detail-modal-field-edit-item-drag-handle"
      >⠿</div>
      <div className="task-detail__detail-modal-field-edit-option-display">
        <SelectionCheckBox width={12} height={12} borderColor={option.colorMain} backgroundColor={option.colorSub} />
        <div className="task-detail__detail-modal-field-edit-option-input-wrapper">
          <input type="text" placeholder="옵션을 입력해주세요." value={option.name} onChange={(e) => onUpdate(option.code, 'name', e.target.value)} autoFocus={autoFocus}/>
        </div>
      </div>
      <div className="task-detail__detail-modal-field-edit-option-actions">
        <SelectionDropdown code={option.code} onUpdate={onColorUpdate} />
        <div className="todo-item__action todo-item__action--delete" onClick={() => onDelete(option.code)}>
          <FontAwesomeIcon icon={faTimes} className="task-detail__detail-modal-field-edit-item--delete" />
        </div>
      </div>
    </li>
  );
};

export default OptionRow;