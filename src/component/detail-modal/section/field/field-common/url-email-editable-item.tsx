import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface ItemWithIdAndValues {
  [key: string]: any;
}

export interface UrlEmailEditableListItemProps {
  item: ItemWithIdAndValues;
  idKey: string;
  value1Key: string;
  value2Key: string;
  placeholder1: string;
  placeholder2: string;
  onUpdate: (id: string | number, fieldKey: string, value: string) => void;
  onDelete: (id: string | number) => void;
  errors?: Record<string | number, string[] | undefined>;
  autoFocus?: boolean;
}

const UrlEmailEditableItem: React.FC<UrlEmailEditableListItemProps> = ({
  item,
  idKey, value1Key, value2Key,
  placeholder1, placeholder2,
  onUpdate, onDelete,
  errors,
  autoFocus,
}) => {
  const itemId = item[idKey] as string | number;
  const currentValue1 = item[value1Key] as string;
  const currentValue2 = item[value2Key] as string;

  const currentItemErrors = errors && errors[itemId] ? errors[itemId] : [];

  return (
    <li className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--url-email" style={{ alignItems: 'baseline' }}>
      <div className="task-detail__detail-modal-field-edit-item-drag-handle">⠿</div>
      <div className="task-detail__detail-modal-field-edit-item-inputs">
        <input type="text"
          className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--first"
          placeholder={placeholder1}
          value={currentValue1}
          onChange={(e) => onUpdate(itemId, value1Key, e.target.value)}
          autoFocus={autoFocus}
        />
        <div className="task-detail__detail-modal-field-edit-input-wrapper">
          <input type="text"
            className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--second"
            placeholder={placeholder2}
            value={currentValue2}
            onChange={(e) => onUpdate(itemId, value2Key, e.target.value)}
            style={{ borderColor: `${currentItemErrors.length > 0 ? '#F04438' : ''}` }}
          />
          {currentItemErrors.length > 0 && (
            <div className="task-detail__detail-modal-field-edit-error-message">
              {currentItemErrors.join(' ')}
            </div>
          )}
        </div>
      </div>
      <div className="todo-item__action todo-item__action--delete" onClick={() => onDelete(itemId)}>
        <FontAwesomeIcon icon={faTimes} className="task-detail__detail-modal-field-edit-item--delete" />
      </div>
    </li>
  );
};

export default UrlEmailEditableItem;