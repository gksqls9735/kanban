import TrashIcon from "../../assets/trash.svg?react";
import DeleteIcon from "../../assets/delete.svg?react";

const DetailHeader: React.FC<{
  onClose: (e: React.MouseEvent) => void;
  openDeleteModal: (e: React.MouseEvent) => void;
  isOwnerOrParticipant: boolean;
}> = ({ onClose, openDeleteModal, isOwnerOrParticipant }) => {
  return (
    <div className="task-detail__detail-modal-header">
      <div className="task-detail__detail-modal-close-button" onClick={onClose}>
        <DeleteIcon width="20" height="20" />
      </div>
      {isOwnerOrParticipant && (
        <div className="task-detail__detail-modal-delete-button" onClick={openDeleteModal}>
          <TrashIcon width="20" height="20" />
        </div>
      )}
    </div>
  );
};

export default DetailHeader;