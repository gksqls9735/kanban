import { forwardRef, useState } from "react";

const RoleDropdown = forwardRef<HTMLDivElement, { position: { top: number; left: number }; onClick: (isMain: boolean) => void; }>(
  ({ position, onClick }, ref) => {
    const [isHoveredPrimary, setIsHoveredPrimary] = useState(false);
    const [isHoveredSecondary, setIsHoveredSecondary] = useState(false);
    return (
      <div
        ref={ref}
        style={{
          position: 'absolute',
          top: `${position.top}px`,
          left: `${position.left}px`,
          border: '1px solid #E4E8EE',
          borderRadius: 4,
          padding: '8px 0px',
          fontSize: 13,
          fontWeight: 400,
          color: '#0F1B2A',
          backgroundColor: 'white',
          boxShadow: '0px 0px 16px 0px #00000014',
          zIndex: 10000,
          width: 120,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div onMouseEnter={() => setIsHoveredPrimary(true)} onMouseLeave={() => setIsHoveredPrimary(false)} onClick={() => onClick(true)}
          style={{
            cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0px 12px', height: 36, backgroundColor: `${isHoveredPrimary ? 'rgb(241, 241, 241)' : ''}`
          }}>주담당자</div>
        <div onMouseEnter={() => setIsHoveredSecondary(true)} onMouseLeave={() => setIsHoveredSecondary(false)} onClick={() => onClick(false)}
          style={{
            cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0px 12px', height: 36, backgroundColor: `${isHoveredSecondary ? 'rgb(241, 241, 241)' : ''}`
          }}>담당자</div>
      </div>
    );
  }
);

export default RoleDropdown;


