import useDropdown from "../../../../hooks/use-dropdown";

const NumericDropdown: React.FC<{
  title: string;
  currentValue: any;
  dropdownList: any[];
}> = ({
  title, currentValue, dropdownList
}) => {
    const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
    return (
      <div className="relative">
        <div ref={wrapperRef} onClick={toggle}
          style={{ height: 40, display: 'flex', gap: 8, padding: '0px 12px', boxSizing: 'border-box', alignItems: 'center' }}>
          <div style={{ width: 96, padding: '4px 0px', boxSizing: 'border-box', fontSize: 13, fontWeight: 400, color: '#0F1B2A' }}>{title}</div>
          <div style={{
            height: 32, display: 'flex', justifyContent: 'space-between',
            border: '1px solid #E4E8EE', borderRadius: 4, flexGrow: 1, alignItems: 'center',
            padding: '0px 10px'
          }}>
            <div style={{ fontWeight: 400, fontSize: 13, color: '#0F1B2A', display: 'flex', alignItems: 'center' }}>{currentValue}</div>
            <div style={{ width: 16, height: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="#0F1B2A" className="bi bi-chevron-down" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
              </svg>
            </div>
          </div>
        </div>
        {isOpen && (
          <div ref={dropdownRef} className="select-dropdown-panel" style={{ width: 436, left: 116 }}>
            {dropdownList.map(item => (
              <div className="select-dropdown-item numeric-dropdown-item truncate">{item}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

export default NumericDropdown;