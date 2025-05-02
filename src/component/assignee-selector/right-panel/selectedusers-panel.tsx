import { Participant } from "../../../types/type";
import SelectedUserItem from "./selecteduser-item";

const SelectedUsersPanel: React.FC<{
  participants: Participant[];
  onRemoveParticipant: (id: string | number) => void;
  onRemoveAll: () => void;
  onToggleDropdown: (id: string | number) => void;
  setTriggerRef: (id: string | number, el: HTMLDivElement | null) => void;
}> = ({ participants, onRemoveParticipant, onRemoveAll, onToggleDropdown, setTriggerRef }) => {
  return (
    <div className="assignee-modal__selected-panel">
    <div className="assignee-modal__selected-header">
      <span className="assignee-modal__selected-count">회원 {participants.length}명 선택</span>
      <span 
        className="assignee-modal__remove-all"
        onClick={onRemoveAll}
      >모두 삭제</span>
    </div>
    <div className="assignee-modal__selected-list kanban-scrollbar-y">
      {participants.map(p => (
        <SelectedUserItem
          key={p.id}
          ref={(el: HTMLDivElement | null) => { setTriggerRef(p.id, el) }}
          participant={p}
          onToggleDropdown={onToggleDropdown}
          onRemove={onRemoveParticipant}
        />
      ))}
    </div>
  </div>
  );
};

export default SelectedUsersPanel;