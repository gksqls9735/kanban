import { useRef, useState } from "react";
import { FileAttachment } from "../../../../types/type";
import { getFileTypeInfo } from "../../common/file-icon";
import ExpandToggle from "../../common/expand-toggle";
import FieldLabel from "./field-common/field-label";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useClickOutside from "../../../../hooks/use-click-outside";
import useTaskStore from "../../../../store/task-store";

const AttachmentField: React.FC<{ attachments?: FileAttachment[], taskId: string, isOwnerOrParticipant: boolean }> = ({ attachments = [], taskId, isOwnerOrParticipant }) => {
  const updateTask = useTaskStore(state => state.updateTask);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const attachmentsToShow = isExpanded ? attachments : attachments.slice(0, 3);
  const hiddenCount = attachments.length - 3;

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  // edit-container를 참조하기 위한 ref 생성
  const editContainerRef = useRef<HTMLDivElement>(null);

  // 취소 및 창 닫기 로직
  const handleCancel = () => {
    setIsInEditMode(false);
  };

  // FieldLabel 클릭 핸들러 (편집 모드 토글 및 초기 상태 설정)
  const handleToggleEditMode = () => {
    if (isInEditMode) {
      handleCancel(); // 이미 편집 모드면 닫기
    } else {
      setIsInEditMode(true);
    }
  };

  useClickOutside(editContainerRef, handleCancel, isInEditMode);

  const handleDeleteFile = (fileId: string) => {
    const updatedFiles = attachments.filter(file => file.fileId !== fileId);
    updateTask(taskId, { taskAttachments: updatedFiles });
  };

  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel fieldName="첨부파일" onClick={handleToggleEditMode} />
      <ul className="task-detail__detail-modal-field-content-list">
        {attachmentsToShow.map(file => {
          const { icon } = getFileTypeInfo(file.fileName);
          return (
            <li key={file.fileId} className="task-detail__detail-modal-field-value-item task-detail__detail-modal-field-item--attachment">
              <a
                href={file.fileUrl}
                download={file.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="task-detail__detail-modal-field-value-item-attachment-link truncate"
              >
                {icon}
                <div className="truncate task-detail__detail-modal-field-value-item-attachment-name">{file.fileName}</div>
                <div className="task-detail__detail-modal-field-value-item-attachment-download">
                  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#1f1f1f">
                    <path d="M160-120v-80h640v80H160Zm320-160L280-480l56-56 104 104v-408h80v408l104-104 56 56-200 200Z" />
                  </svg>
                </div>
              </a>
            </li>
          );
        })}
        {attachmentsToShow.length === 0 && <li className="task-detail__detail-modal-field-edit-item--no-message">표시할 파일이 없습니다.</li>}
        <ExpandToggle hiddenCount={hiddenCount} toggle={() => setIsExpanded(prev => !prev)} isExpanded={isExpanded} />
      </ul>
      {isInEditMode && (
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          <div className="task-detail__detail-modal-field-edit-list-wrapper">
            <ul
              className="kanban-scrollbar-y task-detail__detail-modal-field-edit-url-list">
              {attachments.map(file => {
                const { icon } = getFileTypeInfo(file.fileName, 24);
                return (
                  <li key={file.fileId} style={{ display: 'flex', flexDirection: 'column', padding: '0px 12px', height: 40, boxSizing: 'border-box' }}>
                    <div style={{
                      border: '1px solid #EEF1F6', borderRadius: 4, padding: '4px 8px', display: 'flex', gap: 8, width: 'fit-content',
                    }}>
                      {icon}
                      <div className="truncate"
                        style={{ fontWeight: 400, fontSize: 13, color: '#0F1B2A' }}
                      >{file.fileName}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <div className="task-detail__detail-modal-field-value-item-attachment-download">
                          <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#5F6B7A">
                            <path d="M160-120v-80h640v80H160Zm320-160L280-480l56-56 104 104v-408h80v408l104-104 56 56-200 200Z" />
                          </svg>
                        </div>
                        {isOwnerOrParticipant && (
                          <div className="todo-item__action todo-item__action--delete" style={{ backgroundColor: '#CDD3DD' }} onClick={() => handleDeleteFile(file.fileId)}>
                            <FontAwesomeIcon icon={faTimes} style={{ width: 12, height: 12, color: '#FFFFFF', }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
              {attachments.length === 0 && <li className="task-detail__detail-modal-field-edit-item--no-message">표시할 파일이 없습니다.</li>}
            </ul>
            {isOwnerOrParticipant && (<div className="task-detail__detail-modal-field-edit-separator" />)}
          </div>
          {isOwnerOrParticipant && (
            <div className="task-detail__detail-modal-field-edit-footer" onClick={handleIconClick}>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                style={{ display: 'none' }}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#414D5C" className="bi bi-plus-lg" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
              </svg>
              <span className="task-detail__detail-modal-field-edit-footer-text">파일 추가</span>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export default AttachmentField;
