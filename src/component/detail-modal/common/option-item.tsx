import { useEffect, useRef, useState } from "react";
import { SelectableOption } from "../../../types/type";
import { createPortal } from "react-dom";
import SpeechBubbleTooltip from "../../common/speech-bubble-tooltip";


const OptionItem: React.FC<{ option: SelectableOption, maxWidth?: number}> = ({ option, maxWidth }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  // 1. 호버 상태를 저장할 state를 추가합니다. (초기값: false)
  const [isHovered, setIsHovered] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  const [tooltipPosition, setTooltipPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });

  const handleMouseEnter = () => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 5;
      const left = rect.left + window.scrollX + (rect.width / 2) - 10;
      setTooltipPosition({ top, left });
    }
    setIsHovered(true);
  };

  useEffect(() => {
    const element = spanRef.current;
    if (element) {
      if (element.scrollWidth > element.clientWidth) {
        setIsTruncated(true);
      } else {
        setIsTruncated(false);
      }
    }
  }, [option.name]);

  const itemMaxWidth = maxWidth ? maxWidth : 'none';

  return (
    // 2. 최상위 div에 마우스 이벤트를 추가합니다.
    <div
      className="task-detail__detail-modal-field-value-item task-detail__detail-modal-field-value-item--option"
      style={{ border: `1px solid ${option.colorMain}`, background: `${option.colorSub}`, maxWidth: itemMaxWidth }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        ref={spanRef}
        className="truncate"
        style={{ cursor: 'pointer' }}
      >
        {option.name}
      </span>

      {/* 3. 렌더링 조건을 isTruncated && isHovered 로 변경합니다. */}
      {isTruncated && isHovered && createPortal(
        <div style={{
          position: 'absolute', top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          zIndex: 1000
       }}>
          <style>{style}</style>
          <SpeechBubbleTooltip placement="top" arrowOffset="20px">
            {option.name}
          </SpeechBubbleTooltip>
        </div>, document.body
      )}
    </div>
  );
};

export default OptionItem;

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