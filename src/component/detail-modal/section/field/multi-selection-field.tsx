import { useState } from "react";
import { SelectOption } from "../../../../types/type";
import OptionItem from "../../common/option-item";

const MultiSelection: React.FC<{
  options: SelectOption[];
}> = ({ options }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const optionsToShow = isExpanded ? options : options.slice(0, 3);
  const hiddenLinkCount = options.length - 3;

  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 80, fontSize: 13, fontWeight: 500, flexShrink: 0 }}>다중선택</div>
      <ul style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {optionsToShow.map(option => (
          <OptionItem key={option.code} option={option} />
        ))}
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

export default MultiSelection;