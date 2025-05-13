import { useState } from "react";
import { FileAttachment } from "../../../../types/type";
import { getFileTypeInfo } from "../../common/file-icon";

const AttachmentField: React.FC<{ attachment: FileAttachment[] }> = ({ attachment }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const attachmentsToShow = isExpanded ? attachment : attachment.slice(0, 3);
  const hiddenLinkCount = attachment.length - 3;
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 80, fontSize: 13, fontWeight: 500, flexShrink: 0 }}>첨부파일</div>
      <ul style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {attachmentsToShow.map(file => {
          const { icon } = getFileTypeInfo(file.fileName);
          return (
            <li key={file.fileId}
              style={{
                height: 24, maxWidth: 160, padding: '4px 8px 4px 6px',
                display: 'flex', gap: 8, alignItems: 'center',
                border: '1px solid #E4E8EE', borderRadius: 4, boxSizing: 'border-box',
                fontSize: 13, fontWeight: 400,
              }}>
              {icon}
              <div className="truncate" style={{ fontSize: 13, fontWeight: 400, color: '#0F1B2A' }}>{file.fileName}</div>
              <div style={{ width: 'fit-content', height: 'fit-content', display: 'flex', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#1f1f1f">
                  <path d="M160-120v-80h640v80H160Zm320-160L280-480l56-56 104 104v-408h80v408l104-104 56 56-200 200Z" />
                </svg>
              </div>
            </li>
          )
        })}
        {hiddenLinkCount > 0 && (
          <li onClick={() => setIsExpanded(prev => !prev)} style={{ color: '#8D99A8', display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#8D99A8" className="bi bi-dash" viewBox="0 0 16 16">
                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
              </svg>
            ) : (
              <>
                <div style={{ width: 'fit-content', height: 'fit-content' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#8D99A8" className="bi bi-plus-lg" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                  </svg>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, textAlign: 'center' }}>{hiddenLinkCount}</div>
              </>
            )}
          </li>
        )}
      </ul>
    </li>
  );
};

export default AttachmentField;