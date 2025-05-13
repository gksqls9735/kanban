import { SelectOption } from "../../../types/type";

const OptionItem: React.FC<{ option: SelectOption }> = ({ option }) => {
  return (
    <li style={{
      height: 24, maxWidth: 160, padding: 4,
      display: 'flex', gap: 8, alignItems: 'center',
      border: `${option.colorMain}`, background: `${option.colorSub}`, borderRadius: 4, boxSizing: 'border-box',
      fontSize: 13, fontWeight: 400, color: '#0F1B2A',
    }}>
      <span className="truncate">{option.name}</span>
    </li>
  );
};

export default OptionItem;