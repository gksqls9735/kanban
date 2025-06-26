import { SelectableOption } from "../../../types/type";

const OptionItem: React.FC<{ option: SelectableOption }> = ({ option }) => {
  return (
    <div className="task-detail__detail-modal-field-value-item task-detail__detail-modal-field-value-item--option"
      style={{ border: `${option.colorMain}`, background: `${option.colorSub}` }}>
      <span className="truncate" style={{cursor: 'pointer'}}>{option.name}</span>
    </div>
  );
};

export default OptionItem;