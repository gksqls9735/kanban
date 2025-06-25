
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import SelectionCheckBox from "../field-common/selection-checkbox";
import useDropdown from "../../../../../hooks/use-dropdown";

const SelectionDropdown: React.FC<{
  onUpdate: (code: string, colorMain: string, colorSub: string) => void;
  code: string;
}> = ({ onUpdate, code }) => {
  const { isOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number, width?: number, } | null>(null);
  const [hovered, setHovered] = useState<string>("");

  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX - 70 });
    }
  }, [isOpen]);

  const colorList = [
    { colorMain: '#FFE6EB', colorSub: '#FFEFF2', colorName: '분홍색' },
    { colorMain: '#FFEAD5', colorSub: '#FFF6ED', colorName: '주황색' },
    { colorMain: '#E4F8B4', colorSub: '#F5FFDE', colorName: '연두색' },
    { colorMain: '#D1FADF', colorSub: '#ECFDF3', colorName: '초록색' },
    { colorMain: '#D2FCEE', colorSub: '#E6FFF7', colorName: '청록색' },
    { colorMain: '#F0F9FF', colorSub: '#E0F2FE', colorName: '파란색' },
    { colorMain: '#E4E8EE', colorSub: '#F8F9FB', colorName: '회색' },
    { colorMain: '#D8DCEC', colorSub: '#EAECF5', colorName: '남색' },
    { colorMain: '#E1DDFE', colorSub: '#EDE9FE', colorName: '보라색' },
    { colorMain: '#EFE8D3', colorSub: '#F5F3EA', colorName: '황토색' },
  ]

  return (
    <div className="selection-dropdown">
      <div ref={wrapperRef} onClick={toggle} className="selection-dropdown__toggle-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#7D8998" >
          <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
        </svg>
      </div>
      {isOpen && dropdownPosition && (
        ReactDOM.createPortal(
          <>
            <style>{style}</style>
            <div ref={dropdownRef} className="selection-dropdown__menu" style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}>
              <div className="selection-dropdown__menu-title">컬러 선택</div>
              {colorList.map(color => (
                <div
                  key={color.colorName}
                  onClick={() => onUpdate(code, color.colorMain, color.colorSub)}
                  className="selection-dropdown__color-option"
                  >
                  <SelectionCheckBox width={16} height={16} borderColor={color.colorMain} backgroundColor={color.colorSub} />
                  <div className="selection-dropdown__color-option-name">{color.colorName}</div>
                </div>
              ))}
            </div>
          </>, document.body
        )
      )}
    </div>
  );
};

export default SelectionDropdown;

const style = `
.selection-dropdown__menu {
  position: absolute;
  width: 80px;
  padding: 8px 0px;
  display: flex;
  flex-direction: column;
  border: 1px solid #E4E8EE;
  border-radius: 4px;
  box-shadow: 0px 0px 16px 0px #00000014;
  background-color: white;
  z-index: 20000;
}

.selection-dropdown__menu .selection-dropdown__menu-title {
  display: flex;
  align-items: center;
  padding: 0px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #0F1B2A;
  height: 36px;
}

.selection-dropdown__menu .selection-dropdown__color-option {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  padding: 0px 8px;
  box-sizing: border-box;
  height: 32px;
  cursor: pointer;
}

.selection-dropdown__menu .selection-dropdown__color-option:hover {
  background-color: #ECFDF3;
}

.selection-dropdown__menu .selection-dropdown__color-option-name {
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
}

.selection-dropdown__menu .selection-checkbox {
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  flex-shrink: 0;
  box-sizing: border-box;
  margin-right: 4px;
}
`