import { prioritySelect } from "../../../mocks/select-option-mock";
import SectionSelector from "../../common/selector/section-selector";
import DatePickerTrigger from "../date-picker/datepicker-trigger";
import OptionSelector from "../../common/selector/option-selector";
import AvatarItem from "../../common/avatar/avatar";
import { getInitial } from "../../../utils/text-function";
import ParticipantSelector from "../../participant-select/participant-selector";
import TodoList from "../card-todo/todolist";
import { useUpdateCard, UseUpdateCard } from "../../../hooks/task/use-update-card";

const UpdateCard: React.FC<UseUpdateCard> = ({ onClose, currentTask }) => {
  const {
    cardRef, inputRef, statusList, isOpenParticipantModal, setIsOpenParticipantModal, setIsDatePickerOpen, setIsSelectorOpen,
    selectedSection, selectedPriority, selectedStatus, startDate, endDate, participants, sortedParticipants, minStart,
    handleDateSelect, handleSectionSelect, handlePrioritySelect, handleStatusSelect, handleParticipants, handleInputSubmit,
  } = useUpdateCard({ onClose, currentTask })
  return (
    <div ref={cardRef} className="edit-task-content" style={{ display: 'contents' }} onClick={e => e.stopPropagation()}>

      <SectionSelector selectedSection={selectedSection} onSectionSelect={handleSectionSelect} isOwnerOrParticipant={true} onToggle={setIsSelectorOpen} />

      <input
        type="text"
        ref={inputRef}
        className="new-task-name-input"
        placeholder="작업명 입력"
        onKeyDown={handleInputSubmit}
      />

      <DatePickerTrigger startDate={startDate} endDate={endDate} onDateSelect={handleDateSelect} minStart={minStart} onToggle={setIsDatePickerOpen} />

      <div className="card-meta">
        <div className="card-priority-status">
          <OptionSelector options={prioritySelect} selectedOption={selectedPriority} onSelect={handlePrioritySelect} isOwnerOrParticipant={true} onToggle={setIsSelectorOpen} />
          <OptionSelector options={statusList} selectedOption={selectedStatus} onSelect={handleStatusSelect} isOwnerOrParticipant={true} onToggle={setIsSelectorOpen} />
        </div>
      </div>

      <div className="update-card__participants">
        {sortedParticipants.map(user => (
          <AvatarItem
            key={user.id}
            size={24}
            src={user.icon}
          >
            {getInitial(user.username)}
          </AvatarItem>
        ))}
        <div onClick={() => setIsOpenParticipantModal(true)}>
          <AvatarItem
            key="add"
            isOverflow={true}
            size={24}
            isFirst={false}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#8D99A8" className="bi bi-plus-lg" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
            </svg>
          </AvatarItem>
        </div>
      </div>

      <div className="seperation-line" />

      <TodoList taskId={currentTask.taskId} todoList={currentTask.todoList} isOwnerOrParticipant={true} />
      {isOpenParticipantModal && (
        <ParticipantSelector
          initialParticipants={participants} onClose={() => setIsOpenParticipantModal(false)} onConfirm={handleParticipants}
        />)}
    </div>
  );
};

export default UpdateCard;