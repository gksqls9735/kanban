import AvatarItem from "./avatar";
import { Participant } from "../../types/type";
import { getInitial } from "../../utils/text-function";

const groupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const AvatarGroup: React.FC<{
  list: Participant[];
  maxVisible: number;
  size?: number;
  fontSize?: number;
}> = ({ list, maxVisible, size = 24, fontSize }) => {
  const visibleCount = Math.min(list.length, maxVisible);
  const overflowCount = list.length - visibleCount;

  return (
    <div className={`${list.length > 0 ? 'avatar-group' : ''}`} style={groupStyle}>
      <svg width="0" height="0" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <defs>
          <clipPath id="avatar-squircle-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5,0 C 0.1,0 0,0.1 0,0.5 C 0,0.9 0.1,1 0.5,1 C 0.9,1 1,0.9 1,0.5 C 1,0.1 0.9,0 0.5,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {list.slice(0, visibleCount).map((user, index) => (
        <AvatarItem
          key={user.id}
          size={size}
          isFirst={index > 0}
        >
          {getInitial(user.username)}
        </AvatarItem>
      ))}

      {overflowCount > 0 && (
        <AvatarItem
          key="overflow"
          isOverflow={true}
          size={size}
          isFirst={visibleCount > 0}
        >
          {`+${overflowCount}`}
        </AvatarItem>
      )}

      {list.length === 0 && (
        <AvatarItem
          key="add"
          isOverflow={true}
          size={size}
          isFirst={false}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#8D99A8" className="bi bi-plus-lg" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
          </svg>
        </AvatarItem>
      )}
    </div>
  );
};

export default AvatarGroup;