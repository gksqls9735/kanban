import { User } from "../../../../types/type";
import { getInitial } from "../../../../utils/text-function";
import AvatarItem from "../../../avatar/avatar";

const UserItem: React.FC<{
  user: User;
  isSelected: boolean;
  onSelect: (userId: string | number, select: boolean) => void;
}> = ({ user, isSelected, onSelect }) => {

  const handleChange = () => {
    onSelect(user.id, !isSelected);
  };

  const handleCheckboxAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const checkboxId = `user-check-${user.id}`;
  
  return (
    <div className="participant-modal__user-item"
      style={{ backgroundColor: `${isSelected ? '#D1FADF' : ''}` }}
      onClick={handleChange}
    >
      <div className="participant-modal__user-item-info">
        <AvatarItem size={40} src={user.icon}>{getInitial(user.username)}</AvatarItem>
        <div className="participant-modal__user-item-text">
          <div className="participant-modal__user-item-name-line">
            <span className="participant-modal__user-item-username">{user.username}</span>
            <span className="participant-modal__user-item-team">{user.team}</span>
          </div>
          <span className="participant-modal__user-item-description truncate">{user.tagline}</span>
        </div>
      </div>
      <div className="participant-modal__checkbox-area" onClick={handleCheckboxAreaClick}>
        <input
          type="checkbox"
          checked={isSelected}
          className="participant-modal__checkbox--native"
          id={checkboxId}
          onChange={handleChange}
        />
        <label htmlFor={checkboxId} className="participant-modal__checkbox--visual" />
      </div>
    </div>
  );
};

export default UserItem;