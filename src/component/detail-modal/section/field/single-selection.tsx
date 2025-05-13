import { SelectOption } from "../../../../types/type";
import OptionItem from "../../common/option-item";

const SingleSelection: React.FC<{ option: SelectOption }> = ({ option }) => {
  return (
    <li className="task-detail__detail-modal-field-item">
      <div className="task-detail__detail-modal-field-label">단일선택</div>
      <ul className="task-detail__detail-modal-field-content-list">
        <OptionItem option={option} />
      </ul>
    </li>
  );
};

export default SingleSelection;