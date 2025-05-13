const TextField: React.FC<{ text: string }> = ({ text }) => {
  return (
    <li className="task-detail__detail-modal-field-item">
      <div className="task-detail__detail-modal-field-label">텍스트</div>
      <ul className="task-detail__detail-modal-field-content-list">
        <span className="task-detail__detail-modal-field-item--text">{text}</span>
      </ul>
    </li>
  );
};

export default TextField; 