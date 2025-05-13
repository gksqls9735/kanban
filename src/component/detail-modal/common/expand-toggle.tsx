const ExpandToggle: React.FC<{
  hiddenCount: number;
  toggle: () => void;
  isExpanded: boolean;
}> = ({ hiddenCount, toggle, isExpanded }) => {
  return (
    <>
      {hiddenCount > 0 && (
        <li onClick={toggle} className="task-detail__detail-modal-field-expand-toggle">
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#8D99A8" className="bi bi-dash" viewBox="0 0 16 16">
              <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
            </svg>
          ) : (
            <>
              <div className="task-detail__detail-modal-field-expand-toggle-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#8D99A8" className="bi bi-plus-lg" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                </svg>
              </div>
              <div className="task-detail__detail-modal-field-expand-toggle-count">{hiddenCount}</div>
            </>
          )}
        </li>
      )}
    </>
  );
};

export default ExpandToggle;