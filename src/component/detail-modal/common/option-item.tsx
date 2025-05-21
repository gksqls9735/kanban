import { SelectOption } from "../../../types/type";

const OptionItem: React.FC<{ option: SelectOption }> = ({ option }) => {
  return (
    <div className="task-detail__detail-modal-field-value-item task-detail__detail-modal-field-value-item--option"
      style={{ border: `${option.colorMain}`, background: `${option.colorSub}` }}>
      <span className="truncate">{option.name}</span>
    </div>
  );
};

export default OptionItem;