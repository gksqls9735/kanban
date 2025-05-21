
const PLUSICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#414D5C" className="bi bi-plus-lg" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
  </svg>
);

const EDITICON = (
  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#414D5C">
    <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
  </svg>
);

const FieldFooter: React.FC<{
  title: string;
  isPlusIcon: boolean;
  onClick: () => void;
  handleCancel?: () => void;
  isShowButton?: boolean;
}> = ({ title, isPlusIcon, onClick, handleCancel, isShowButton = false }) => {

  const svgIcon = isPlusIcon ? PLUSICON : EDITICON

  return (
    <div className="task-detail__detail-modal-field-edit-footer justify-between">
      <div className="task-detail__detail-modal-field-footer-action-left" onClick={onClick}>
        {svgIcon}
        <span className="task-detail__detail-modal-field-edit-footer-text">{title}</span>
      </div>
      {isShowButton && (
        <div className="task-detail__detail-modal-field-footer-actions">
          <div onClick={handleCancel}>취소</div>
          <div>저장</div>
        </div>
      )}
    </div>
  );
};

export default FieldFooter;
