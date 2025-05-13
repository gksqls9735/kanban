import { NumericField } from "../../../../types/type";

const NumericFieldComponent: React.FC<{ numericField: NumericField }> = ({ numericField }) => {
  const formattedValue = numericField.value.toFixed(numericField.decimalPlaces);

  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 80, fontSize: 13, fontWeight: 500, flexShrink: 0 }}>숫자</div>
      <ul style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <li style={{ display: 'flex', gap: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 400 }}>{formattedValue}</div>
          <div style={{ fontSize: 13, fontWeight: 400, textAlign: 'right', verticalAlign: 'middle' }}>{numericField.unit}</div>
        </li>
      </ul>
    </li>
  );
};

export default NumericFieldComponent;