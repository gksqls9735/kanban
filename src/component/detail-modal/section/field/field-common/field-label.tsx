import EditIcon from "../../../../../assets/edit.svg?react";

const FieldLabel: React.FC<{ fieldName: string, onClick: () => void; }> = ({ fieldName, onClick }) => {
  return (
    <div className="task-detail__detail-modal-field-label">
      <span>{fieldName}</span>
      <div onClick={onClick} className="task-detail__detail-modal-field-label-edit-icon">
        <EditIcon width="12" height="12" />
      </div>
    </div>
  );
};

export default FieldLabel;