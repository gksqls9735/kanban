import { useState } from "react";
import { FileAttachment } from "../../../../types/type";
import { getFileTypeInfo } from "../../common/file-icon";
import ExpandToggle from "../../common/expand-toggle";

const AttachmentField: React.FC<{ attachment: FileAttachment[] }> = ({ attachment }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const attachmentsToShow = isExpanded ? attachment : attachment.slice(0, 3);
  const hiddenCount = attachment.length - 3;
  return (
    <li className="task-detail__detail-modal-field-item">
      <div className="task-detail__detail-modal-field-label">첨부파일</div>
      <ul className="task-detail__detail-modal-field-content-list">
        {attachmentsToShow.map(file => {
          const { icon } = getFileTypeInfo(file.fileName);
          return (
            <li key={file.fileId} className="task-detail__detail-modal-field-value-item task-detail__detail-modal-field-item--attachment">
              {icon}
              <div className="truncate task-detail__detail-modal-field-value-item-attachment-name">{file.fileName}</div>
              <div className="task-detail__detail-modal-field-value-item-attachment-download">
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#1f1f1f">
                  <path d="M160-120v-80h640v80H160Zm320-160L280-480l56-56 104 104v-408h80v408l104-104 56 56-200 200Z" />
                </svg>
              </div>
            </li>
          )
        })}
        <ExpandToggle hiddenCount={hiddenCount} toggle={() => setIsExpanded(prev => !prev)} isExpanded={isExpanded} />
      </ul>
    </li>
  );
};

export default AttachmentField;