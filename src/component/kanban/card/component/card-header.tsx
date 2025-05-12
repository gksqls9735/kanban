import { useState } from "react";
import useDropdown from "../../../../hooks/use-dropdown";
import useTaskStore from "../../../../store/task-store";
import { Task } from "../../../../types/type";
import { truncateText } from "../../../../utils/text-function";
import DeleteModal from "../../delete-modal";
import useUserStore from "../../../../store/user-store";
import { useToast } from "../../../../context/toast-context";
import DetailModal from "../../detail-modal";

const CardHeader: React.FC<{
  task: Task;
  sectionName: string;
  onClick: () => void;
  onModalStateChange: (isOpen: boolean) => void;
}> = ({ task, sectionName, onClick, onModalStateChange }) => {
  const currentUser = useUserStore(state => state.currentUser);

  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const deleteTask = useTaskStore(state => state.deletTask);
  const copyTask = useTaskStore(state => state.copyTask);
  const { showToast } = useToast();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyTask(task);
    setIsOpen(false);
  };

  const handleDeleteConfirm = () => {
    deleteTask(task.taskId);
    closeDeleteModal();
    showToast('작업이 성공적으로 삭제되었습니다.');
  };

  const openDeleteModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
    setIsOpen(false);
    onModalStateChange(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    if (!isDetailModalOpen) onModalStateChange(false);
  }

  const openDetailModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetailModalOpen(true);
    onModalStateChange(true);
  };

  const closeDetailModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetailModalOpen(false);
    onModalStateChange(false);
  };

  const isTaskOnwer = task.taskOwner.id === currentUser?.id;

  const isOwnerOrMainParticipant = isTaskOnwer ||
    task.participants.some(p => p.id === currentUser?.id && p.isMain);

  const isOwnerOrParticipant = isTaskOnwer ||
    task.participants.some(p => p.id === currentUser?.id);

  return (
    <>
      <div className="card-header">
        <div className="card-current-section">{truncateText(sectionName, 10)}</div>
        {isOwnerOrParticipant && (
          <div className="card-header__actions">
            {isOwnerOrMainParticipant && (
              <div onClick={onClick}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#8D99A8" style={{ padding: 5 }}>
                  <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                </svg>
              </div>
            )}
            <div ref={wrapperRef} onClick={toggle}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#8D99A8" style={{ padding: 5 }}>
                <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
              </svg>
            </div>
          </div>
        )}
        {isOpen && (
          <div ref={dropdownRef} className="header-dropdown-menu card-header__dropdown-menu">
            <div className="header-dropdown-item" onClick={openDetailModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-plus-square" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
              </svg>
              상세 보기
            </div>
            <div className="header-dropdown-item" onClick={handleCopy}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-plus-square" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
              </svg>
              작업 복사
            </div>
            {isOwnerOrMainParticipant && (
              <div className="header-dropdown-item" onClick={openDeleteModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                </svg>
                작업 삭제
              </div>
            )}
          </div>
        )}
      </div>
      {isDeleteModalOpen && (
        <DeleteModal
          message={'작업을 삭제하시겠습니까?'}
          onCancel={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {isDetailModalOpen && (
        <DetailModal
          task={task}
          onClose={closeDetailModal}
          openDeleteModal={openDeleteModal}
        />
      )}
    </>
  );
};

// const areHeaderPropsEqual = (prevProps: any, nextProps: any) => {
//   return (
//     prevProps.sectionName === nextProps.sectionName &&
//     prevProps.onClick === nextProps.onClick &&
//     prevProps.task.taskId === nextProps.task.taskId
//   );
// };


export default CardHeader;