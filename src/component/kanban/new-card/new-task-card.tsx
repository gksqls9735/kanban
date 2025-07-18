import { prioritySelect } from "../../../mocks/select-option-mock";
import OptionSelector from "../../common/selector/option-selector";
import DatePickerTrigger from "../date-picker/datepicker-trigger";
import SectionSelector from "../../common/selector/section-selector";
import AvatarItem from "../../common/avatar/avatar";
import { getInitial } from "../../../utils/text-function";
import ParticipantSelector from "../../participant-select/participant-selector";
import { useNewTaskCard } from "../../../hooks/task/use-new-task-card";
import TodoListEditor from "./todolist-editor";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SPEECH_BUBBLE_TOOLTIP_STYLE } from "../../../constant/style-constant";
import SpeechBubbleTooltip from "../../common/speech-bubble-tooltip";

const NewTaskCard: React.FC<{
  columnId: string;
  onClose: (closedId: string) => void;
  newCardId: string;
}> = ({ columnId, onClose, newCardId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const {
    cardRef, inputRef, newTaskId,
    statusList,
    selectedSection, selectedPriority, selectedStatus,
    startDate, endDate, todos, participants,
    isOpenParticipantModal, setIsOpenParticipantModal,
    handleDateSelect, handleSectionSelect, handlePrioritySelect, handleStatusSelect, handleTodosChange, handleParticipants,
    handleInputSubmit
  } = useNewTaskCard({ columnId, onClose, newCardId, isDropdownOpen });

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 5;
      const left = rect.left + window.scrollX + (rect.width / 2) + 17;
      setTooltipPosition({ top, left });
    }
    setIsHovered(true);
  };

  return (
    <>
      <div ref={cardRef} className="kanban-card relative">

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <SectionSelector selectedSection={selectedSection} onSectionSelect={handleSectionSelect} isOwnerOrParticipant={true} onToggle={setIsDropdownOpen} />
          <div className="task-detail__detail-modal-close-button" onClick={() => onClose(newCardId)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="#8D99A8" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x" id="X--Streamline-Feather" height="16" width="16">
              <desc>X Streamline Icon: https://streamlinehq.com</desc>
              <path d="M11.25 3.75 3.75 11.25" strokeWidth="1"></path>
              <path d="m3.75 3.75 7.5 7.5" strokeWidth="1"></path>
            </svg>
          </div>
        </div>

        <input
          type="text"
          ref={inputRef}
          className="new-task-name-input"
          placeholder="작업명 입력"
          onKeyDown={handleInputSubmit}
        />

        <DatePickerTrigger startDate={startDate} endDate={endDate} onDateSelect={handleDateSelect} onToggle={setIsDropdownOpen} />

        <div className="card-meta">
          <div className="card-priority-status">
            <OptionSelector options={prioritySelect} selectedOption={selectedPriority} onSelect={handlePrioritySelect} isOwnerOrParticipant={true} onToggle={setIsDropdownOpen} />
            <OptionSelector options={statusList} selectedOption={selectedStatus} onSelect={handleStatusSelect} isOwnerOrParticipant={true} onToggle={setIsDropdownOpen} />
          </div>
        </div>

        <div className="update-card__participants">
          {participants.map(user => (
            <AvatarItem
              key={user.id}
              size={24}
              src={user.icon}
            >
              {getInitial(user.username)}
            </AvatarItem>
          ))}
          <div ref={triggerRef} onClick={() => setIsOpenParticipantModal(true)} style={{ position: 'relative' }} onMouseEnter={handleMouseEnter} onMouseLeave={() => setIsHovered(false)}>
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
            {isHovered && createPortal(
              <div
                style={{
                  position: 'absolute',
                  top: `${tooltipPosition.top}px`,
                  left: `${tooltipPosition.left}px`,
                  transform: 'translateX(-50%)',
                  zIndex: 9999,
                }}>
                <style>{SPEECH_BUBBLE_TOOLTIP_STYLE}</style>
                <SpeechBubbleTooltip placement="top" arrowOffset="20px" maxWidth={100}>담당자 지정</SpeechBubbleTooltip>
              </div>, document.body
            )}
          </div>
        </div>

        <div className="seperation-line" />

        <TodoListEditor initialTodos={todos} onTodosChange={handleTodosChange} newTaskId={newTaskId} />
        {isOpenParticipantModal && (
          <ParticipantSelector
            initialParticipants={participants} onClose={() => setIsOpenParticipantModal(false)} onConfirm={handleParticipants}
          />)}
      </div>
    </>
  );
};

export default NewTaskCard;