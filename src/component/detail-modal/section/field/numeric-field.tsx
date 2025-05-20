import { NumericField } from "../../../../types/type";
import FieldLabel from "./field-label";

const NumericFieldComponent: React.FC<{ numericField: NumericField }> = ({ numericField }) => {
  const formattedValue = numericField.value.toFixed(numericField.decimalPlaces);

  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel fieldName="숫자"/>
      <ul className="task-detail__detail-modal-field-content-list">
        <li className="task-detail__detail-modal-field-item--numeric">
          <div>{formattedValue}</div>
          <div>{numericField.unit}</div>
        </li>
      </ul>
    </li>
  );
};

export default NumericFieldComponent;