import { SelectOption } from "../../../../types/type";
import OptionItem from "../../common/option-item";

const SingleSelection: React.FC<{ option: SelectOption }> = ({ option }) => {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 80, fontSize: 13, fontWeight: 500, flexShrink: 0 }}>단일선택</div>
      <ul style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <OptionItem option={option} />
      </ul>
    </li>
  );
};

export default SingleSelection;