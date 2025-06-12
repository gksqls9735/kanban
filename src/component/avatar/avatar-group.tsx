import { Participant } from "../../types/type";
import { getInitial } from "../../utils/text-function";
import AvatarItem from "./avatar";

const groupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
}

const AvatarGroup: React.FC<{
  list: Participant[];
  maxVisible: number;
  size?: number;
}> = ({ list, maxVisible, size = 24 }) => {
  const visibleCount = Math.min(list.length, maxVisible);
  const overflowCount = list.length - visibleCount;

  return (
    <div className={`${list.length > 0 ? 'avatar-group' : ''}`} style={groupStyle}>
      {list.slice(0, visibleCount).map((user, index) => (
        <AvatarItem
          key={user.id}
          size={size}
          isFirst={index > 0}
          src={user.icon}
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