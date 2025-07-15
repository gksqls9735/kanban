import { useRef, useState } from "react";
import { FileAttachment } from "../../../../types/type";
import { getFileTypeInfo } from "../../common/file-icon";
import { createPortal } from "react-dom";
import SpeechBubbleTooltip from "../../../common/speech-bubble-tooltip";

const InputFileItem: React.FC<{
  file: FileAttachment;
  onDelete: (file: FileAttachment) => void;
}> = ({ file, onDelete }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const triggerRef = useRef<HTMLLIElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 5;
      const left = rect.left + window.scrollX + (rect.width / 2) - 20;
      setTooltipPosition({ top, left });
    }
    setIsHovered(true);
  };

  const isImg = file.fileType.startsWith('image/');
  const { icon } = getFileTypeInfo(file.fileName, 24);

  return (
    <li
      ref={triggerRef}
      style={{ position: 'relative' }}
      className="task-detail__detail-modal-chat-input--file-list"
      onMouseEnter={() => handleMouseEnter()} onMouseLeave={() => setIsHovered(false)}
    >
      <div className="task-detail__detail-modal-field-value-item-attachment-link truncate">
        {isImg ? (
          <img src={file.fileUrl} alt={file.fileName} />
        ) : (
          icon
        )}
        <div style={{ maxWidth: 130 }} className="truncate task-detail__detail-modal-field-value-item-attachment-name truncate">{file.fileName}</div>
        <div className="task-detail__detail-modal-field-value-item-attachment-download" onClick={() => onDelete(file)} style={{ cursor: 'pointer' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="#8D99A8" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x" id="X--Streamline-Feather" height="14" width="14">
            <desc>X Streamline Icon: https://streamlinehq.com</desc>
            <path d="M11.25 3.75 3.75 11.25" strokeWidth="1"></path>
            <path d="m3.75 3.75 7.5 7.5" strokeWidth="1"></path>
          </svg>
        </div>
      </div>
      {isHovered && createPortal(
        <>
          <style>{style}</style>
          <div
            style={{
              position: 'absolute',
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              zIndex: 9999,
            }}>
            <SpeechBubbleTooltip placement="top" arrowOffset="20px">{file.fileName}</SpeechBubbleTooltip>
          </div>
        </>, document.body
      )}
    </li>
  );
};

export default InputFileItem;


const style = `
.speech-bubble-tooltip {
  position: relative;
  width: fit-content;
  max-width: 200px;
  height: fit-content;
  background-color: #4A4A52;
  border-radius: 2px;
  padding: 6px;
  box-sizing: border-box;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 400;
  text-align: center;
  line-height: 130%;
}

.speech-bubble-tooltip::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
}

/* 위쪽 회살표 */
.speech-bubble-tooltip-top::before {
  top: -6px;
  left: var(--arrow-offset, 50%);
  transform: translateX(-50%);
  border-bottom: 7px solid #4A4A52;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
}

/* 아래쪽 화살표 */
.speech-bubble-tooltip-bottom::before {
  bottom: -6px;
  left: var(--arrow-offset, 50%);
  transform: translateX(-50%);
  border-top: 7px solid #4A4A52;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
}

/* 왼쪽 화살표 */
.speech-bubble-tooltip-left::before {
  left: -6px;
  top: var(--arrow-offset, 50%);
  transform: translateY(-50%);
  border-right: 7px solid #4A4A52;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

/* 오른쪽 화살표 */
.speech-bubble-tooltip-right::before {
  right: -6px;
  top: var(--arrow-offset, 50%);
  transform: translateY(-50%);
  border-left: 7px solid #4A4A52;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}
`