import { useState } from "react";
import { SelectOption } from "../../../../types/type";
import OptionItem from "../../common/option-item";
import ExpandToggle from "../../common/expand-toggle";

const MultiSelection: React.FC<{
  options: SelectOption[];
}> = ({ options }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const optionsToShow = isExpanded ? options : options.slice(0, 3);
  const hiddenCount = options.length - 3;

  return (
    <li className="task-detail__detail-modal-field-item">
      <div className="task-detail__detail-modal-field-label">다중선택</div>
      <ul className="task-detail__detail-modal-field-content-list">
        {optionsToShow.map(option => (
          <OptionItem key={option.code} option={option} />
        ))}
        <ExpandToggle hiddenCount={hiddenCount} toggle={() => setIsExpanded(prev => !prev)} isExpanded={isExpanded} />
      </ul>
    </li>
  );
};

export default MultiSelection;