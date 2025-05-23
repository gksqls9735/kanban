
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import useDropdown from "../../../../../hooks/use-dropdown";
import SelectionCheckBox from "../field-common/selection-checkbox";

const SelectionDropdown: React.FC<{
  onUpdate: (code: string, colorMain: string, colorSub: string) => void;
  code: string;
}> = ({ onUpdate, code }) => {
  const { isOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number, width?: number, } | null>(null);
  const portalElement = typeof window !== 'undefined' ? document.getElementById('portal-root') : null;
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
    <div style={{ position: 'relative' }}>
      <div ref={wrapperRef} onClick={toggle} style={{ width: 16, height: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#7D8998" >
          <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
        </svg>
      </div>
      {isOpen && portalElement && dropdownPosition && (
        ReactDOM.createPortal(
          <div ref={dropdownRef} style={{
            position: 'absolute', top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`,
            width: 80, padding: '8px 0px', display: 'flex', flexDirection: 'column',
            border: '1px solid #E4E8EE', borderRadius: 4, boxShadow: '0px 0px 16px 0px #00000014',
            backgroundColor: 'white', zIndex: 20000,
          }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#0F1B2A', height: 36, padding: '0px 12px', display: 'flex', alignItems: 'center' }}>컬러 선택</div>
            {colorList.map(color => (
              <div
                key={color.colorName}
                onClick={() => onUpdate(code, color.colorMain, color.colorSub)}
                onMouseEnter={() => setHovered(color.colorName)} onMouseLeave={() => setHovered('')}
                style={{
                  height: 32, gap: 8, boxSizing: 'border-box', display: 'flex', alignItems: 'center', flexWrap: 'nowrap', padding: '0px 8px',
                  backgroundColor: `${hovered === color.colorName ? '#ECFDF3' : ''}`, cursor: 'pointer'
                }}
              >
                <SelectionCheckBox width={16} height={16} borderColor={color.colorMain} backgroundColor={color.colorSub} />
                <div style={{ fontSize: 13, fontWeight: 400, whiteSpace: 'nowrap', }}>{color.colorName}</div>
              </div>
            ))}
          </div>, portalElement
        )
      )}
    </div>
  );
};

export default SelectionDropdown;