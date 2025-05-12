const DetailHeader: React.FC<{
  onClose: (e: React.MouseEvent) => void;
  openDeleteModal: (e: React.MouseEvent) => void;
}> = ({ onClose, openDeleteModal }) => {
  return (
    <div className="task-detail__detail-modal-header">
      <div className="task-detail__detail-modal-close-button" onClick={onClose}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="#8D99A8" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x" id="X--Streamline-Feather" height="16" width="16">
          <desc>X Streamline Icon: https://streamlinehq.com</desc>
          <path d="M11.25 3.75 3.75 11.25" strokeWidth="1"></path>
          <path d="m3.75 3.75 7.5 7.5" strokeWidth="1"></path>
        </svg>
      </div>
      <div className="task-detail__detail-modal-delete-button" onClick={openDeleteModal}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
        </svg>
      </div>
    </div>
  );
};

export default DetailHeader;