import { Participant } from "../../../../types/type";
import { getInitial } from "../../../../utils/text-function";
import AvatarItem from "../../../avatar/avatar";

const UserField: React.FC<{ users: Participant[] }> = ({ users }) => {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 80, fontSize: 13, fontWeight: 500, flexShrink: 0 }}>사용자</div>
      <ul style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {users.map(user => (
          <li key={user.id}
            style={{
              display: 'flex', gap: 6, alignItems: 'center',
            }}>
            <AvatarItem size={24}>{getInitial(user.username)}</AvatarItem>
            <div style={{ fontSize: 13, fontWeight: 400 }}>{user.username}</div>
          </li>
        ))}
      </ul>
    </li>
  );
};

export default UserField;