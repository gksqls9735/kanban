const IdField: React.FC<{ prefix: string, taskId: string }> = ({ prefix, taskId }) => {
  return (
    <li className="task-detail__detail-modal-field-item">
      <div className="task-detail__detail-modal-field-label">ID</div>
      <ul className="task-detail__detail-modal-field-content-list">
        <li className="task-detail__detail-modal-field-value-item--id">{`${prefix}-${taskId}`}</li>
      </ul>
    </li>
  );
};

export default IdField;