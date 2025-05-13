import { NumericField } from "../../../../types/type";

const NumericFieldComponent: React.FC<{ numericField: NumericField }> = ({ numericField }) => {
  const formattedValue = numericField.value.toFixed(numericField.decimalPlaces);

  return (
    <li className="task-detail__detail-modal-field-item">
      <div className="task-detail__detail-modal-field-label">숫자</div>
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