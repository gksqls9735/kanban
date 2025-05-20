import { Participant } from "../../../../types/type";
import { getInitial } from "../../../../utils/text-function";
import AvatarItem from "../../../avatar/avatar";
import FieldLabel from "./field-label";

const UserField: React.FC<{ users: Participant[] }> = ({ users }) => {
  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel fieldName="사용자" />
      <ul className="task-detail__detail-modal-field-content-list task-detail__detail-modal-field-content-list--user">
        {users.map(user => (
          <li key={user.id} className="task-detail__detail-modal-field-value-item--user">
            <AvatarItem size={24}>{getInitial(user.username)}</AvatarItem>
            <div>{user.username}</div>
          </li>
        ))}
      </ul>
    </li>
  );
};

export default UserField;