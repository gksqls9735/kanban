import { SelectOption } from "../../../../types/type";
import OptionItem from "../../common/option-item";
import FieldLabel from "./field-label";

const SingleSelection: React.FC<{ option: SelectOption }> = ({ option }) => {
  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel fieldName="단일선택" />
      <ul className="task-detail__detail-modal-field-content-list">
        <OptionItem option={option} />
      </ul>
    </li>
  );
};

export default SingleSelection;