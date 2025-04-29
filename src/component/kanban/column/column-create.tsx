import { useEffect, useMemo, useRef, useState } from "react";
import { colors, ViewModes } from "../../../constants";

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="white" strokeWidth="1.28" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ColumnCreate: React.FC<{
  viewMode: string;
  isAdd: boolean,
  toggle: () => void;
  onAdd: (name: string, color?: string) => void;
}> = ({ viewMode, isAdd, toggle, onAdd }) => {
  const [selectedColor, setSelectedColor] = useState<string>(colors[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdd && inputRef.current) {
      inputRef.current.focus();
      if (viewMode === ViewModes.STATUS) setSelectedColor(colors[0]);
    }
    if (!isAdd && inputRef.current) inputRef.current.value = '';
  }, [isAdd, viewMode]);

  const handleAddClick = () => {
    const name = inputRef.current?.value.trim();
    if (name) {
      const colorToAdd = viewMode === ViewModes.STATUS ? selectedColor : undefined;
      onAdd(name, colorToAdd);
    } else {
      inputRef.current?.focus();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddClick();
    } else if (e.key === "Escape") {
      e.preventDefault();
      toggle();
    }
  };

  const placeholderTxt = useMemo(() => viewMode === ViewModes.STATUS ? '상태명' : '섹션명', [viewMode]);

  return (
    <>
      <div>
        <div className="new-section">
          <input ref={inputRef} type="text" placeholder={placeholderTxt} onKeyDown={handleInputKeyDown} />
          <div className="create-confirm-button" onClick={handleAddClick}>확인</div>
        </div>
        {viewMode === ViewModes.STATUS && (
          <div className="new-section__color-picker">
            <span className="new-section__color-picker-title">컬러 선택</span>
            <div className="new-section__color-swatches">
              {colors.map(color => (
                <div
                  key={color}
                  className="new-section__color-swatch"
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                >
                  {selectedColor === color && <CheckIcon />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ColumnCreate;