import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AvatarItem from "./avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Participant } from "../../types/type";

const groupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};


const getInitial = (name: string): string => {
  return name && name.trim().length > 0 ? name.trim()[0].toUpperCase() : '';
};


const AvatarGroup: React.FC<{
  list: Participant[];
  maxVisible: number;
  size?: number;
}> = ({ list, maxVisible, size = 24 }) => {
  const visibleCount = Math.min(list.length, maxVisible);
  const overflowCount = list.length - visibleCount;

  return (
    <div className="avatar-group" style={groupStyle}>
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
          <FontAwesomeIcon icon={faPlus} style={{width: 16, height: 16, color: 'rgba(125, 137, 152, 1)'}} className="폰트어썸"/>
        </AvatarItem>
      )}
    </div>
  );
};

export default AvatarGroup;