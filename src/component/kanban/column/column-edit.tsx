import { colors, ViewModes } from "../../../constants";
import useColumnInput from "../../../hooks/use-column-input";

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="white" strokeWidth="1.28" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ColumnEdit: React.FC<{
  viewMode: string;
  isEdting: boolean;
  toggle: () => void;
  onUpdate: (name: string, color?: string) => void;
  colorMain?: string;
  columnTitle: string
}> = ({ viewMode, isEdting, toggle, onUpdate, colorMain, columnTitle }) => {
  const {
    inputRef, selectedColor, placeholderTxt,
    handleConfirmClick, handleInputKeyDown, handleColorSelect,
  } = useColumnInput({
    isActive: isEdting, viewMode: viewMode, initialName: columnTitle, initialColor: colorMain, onSubmit: onUpdate, onToggle: toggle,
  })

  if (!isEdting) return null;

  return (
    <>
      <div>
        <div className="new-section">
          <input ref={inputRef} type="text" placeholder={placeholderTxt} onKeyDown={handleInputKeyDown} />
          <div className="create-confirm-button" onClick={handleConfirmClick}>확인</div>
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
                  onClick={() => handleColorSelect(color)}
                >
                  {selectedColor.toLowerCase() === color.toLowerCase() && <CheckIcon />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ColumnEdit;