import { useMemo, useState } from "react";
import UserItem from "./user-item";
import { User } from "../../../../types/type";

import SearchIcon from "../../../../assets/participant-search.svg?react";


const UserListPanel: React.FC<{
  users: User[];
  selectedParticipantIds: Set<string | number>;
  onSelectUser: (userId: string | number, select: boolean) => void;
  onSelectAll: (select: boolean, filteredUsers: User[]) => void;
}> = ({ users, selectedParticipantIds, onSelectUser, onSelectAll }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(u =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.team.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const isAllFilteredSelected = useMemo(() => {
    if (filteredUsers.length === 0) return false;
    return filteredUsers.every(u => selectedParticipantIds.has(u.id));
  }, [filteredUsers, selectedParticipantIds]);

  const handleSelectAllChange = () => { onSelectAll(!isAllFilteredSelected, filteredUsers); };

  return (
    <div className="participant-modal__left-panel">
      <div className="participant-modal__search-container">
        <div className="participant-modal__search-bar">
          <input
            className="participant-modal__search-input"
            placeholder="이름, 직위로 찾기"
            type="text"
            onChange={e => setSearchTerm(e.target.value)}
          />
          <SearchIcon width="16" height="16" />
        </div>
      </div>
      <div className="participant-modal__user-list kanban-scrollbar-y">
        <div className="participant-modal__select-all-row">
          <label htmlFor="all-user-check">모두 선택</label>
          <div className="participant-modal__checkbox-area">
            <input
              type="checkbox"
              checked={isAllFilteredSelected}
              className="participant-modal__checkbox--native"
              id="all-user-check"
              onChange={handleSelectAllChange}
              ref={input => {
                if (input) {
                  const anyFilteredSelected = filteredUsers.some(u => selectedParticipantIds.has(u.id));
                  input.indeterminate = !isAllFilteredSelected && anyFilteredSelected;
                }
              }}
            />
            <label htmlFor="all-user-check" className="participant-modal__checkbox--visual" />
          </div>
        </div>
        {filteredUsers.map(u => (
          <UserItem
            key={u.id}
            user={u}
            isSelected={selectedParticipantIds.has(u.id)}
            onSelect={onSelectUser}
          />
        ))}
      </div>
    </div>
  );
};

export default UserListPanel;