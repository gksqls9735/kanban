import { useEffect, useRef, useState } from "react";
import { useImportanceSlider } from "../../../../hooks/use-importance-slider";

const ImportanceField: React.FC<{
  initialValue: number;
  onChange: (value: number) => void;
  isOwnerOrParticipant: boolean;
}> = ({ initialValue, onChange: parentOnChange, isOwnerOrParticipant }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentValue, setCurrentValue] = useState<number>(initialValue);

  useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  const handleSliderChange = (newValue: number) => {
    setCurrentValue(newValue);
    if (isOwnerOrParticipant && newValue !== initialValue) parentOnChange(newValue);
  };


  const { onMouseDownHandler: hookMouseDownHandler, isDragging } = useImportanceSlider({
    trackRef,
    value: currentValue,
    onChange: handleSliderChange,
    min: 0,
    max: 2,
    step: 0.5,
  });

  const handlerLeftPercent = (currentValue / 2) * 100;
  const actualMouseDownHandler = isOwnerOrParticipant ? hookMouseDownHandler : undefined;
  const cursorStyle = isOwnerOrParticipant ? (isDragging ? 'grabbing' : 'grab') : 'default';

  return (
    <div className="task-detail__detail-modal-info-row task-detail__detail-modal-info-row--weight">
      <div className="task-detail__detail-modal-info-label">
        <div className="task-detail__detail-modal-info-label-weight">
          <div className="task-detail__detail-modal-info-label-weight-text">가중치</div>
          <div className="task-detail__detail-modal-info-label-weight-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#1f1f1f">
              <path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="task-detail__detail-modal-info-weight-slider" >
        <div ref={trackRef} className="task-detail__detail-modal-info-weight-track">
          <div className="task-detail__detail-modal-info-weight-track-bg" />
          {['0%', '25%', '50%', '75%', '100%'].map((leftPosition, index) => (
            <div key={index} className="task-detail__detail-modal-info-weight-tick" style={{ left: leftPosition }} />
          ))}
          <div className="task-detail__detail-modal-info-weight-handler" onMouseDown={actualMouseDownHandler}
            style={{ left: `${handlerLeftPercent}%`, cursor: cursorStyle }} />
        </div>
        <div className="task-detail__detail-modal-info-weight-labels">
          {[
            { label: '0', left: '0%' },
            { label: '0.5', left: '25%' },
            { label: '1', left: '50%' },
            { label: '1.5', left: '75%' },
            { label: '2', left: '100%' }
          ].map((item, index) => (
            <span key={`label-${index}`} className="task-detail__detail-modal-info-weight-label" style={{ left: item.left }}>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ImportanceField;