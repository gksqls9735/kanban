const DeleteModal: React.FC<{
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ title, message, onCancel, onConfirm }) => {
  return (
    <div className="delete-modal">
      <div className="delete-modal__icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#D92D20">
          <path d="M440-400v-360h80v360h-80Zm0 200v-80h80v80h-80Z" />
        </svg>
      </div>
      <div className="delete-modal__content">
        {title && (<div className="delete-modal__title" dangerouslySetInnerHTML={{ __html: title }} />)}
        <div className="delete-modal__message" dangerouslySetInnerHTML={{ __html: message }} />
      </div>
      <div className="delete-modal__actions">
        <button
          className="delete-modal__button delete-modal__button--cancel" onClick={onCancel}>
          취소</button>
        <button
          className="delete-modal__button delete-modal__button--confirm" onClick={onConfirm}>확인</button>
      </div>
    </div >
  );
};

export default DeleteModal;