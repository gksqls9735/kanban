import { priorityMedium, prioritySelect } from "../../../mocks/select-option-mock";
import useStatusesStore from "../../../store/statuses-store";
import useSectionsStore from "../../../store/sections-store";
import { useEffect, useMemo, useRef, useState } from "react";
import { Participant, Section, SelectOption, Task, Todo } from "../../../types/type";
import useTaskStore from "../../../store/task-store";
import SectionSelector from "../new-card/section-selector";
import DatePickerTrigger from "../new-card/datepicker-trigger";
import OptionSelector from "../new-card/option-selector";
import TodoListEditor from "../new-card/todolist-editor";
import AvatarItem from "../../avatar/avatar";
import { generateUniqueId, getInitial } from "../../../utils/text-function";
import ParticipantSelector from "../../participant-select/participant-selector";

const UpdateCard: React.FC<{
  onClose: () => void;
  currentTask: Task;
}> = ({ onClose, currentTask }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateTask = useTaskStore(state => state.updateTask);
  const statusList = useStatusesStore(state => state.statusList);
  const sections = useSectionsStore(state => state.sections);

  const [isOpenParticipantModal, setIsOpenParticipantModal] = useState<boolean>(false);

  const [selectedSection, setSelectedSection] = useState<Section>(() => {
    return sections.find(sec => sec.sectionId === currentTask.sectionId) || sections[0];
  });
  const [selectedPriority, setSelectedPriority] = useState<SelectOption>(currentTask.priority || priorityMedium);
  const [selectedStatus, setSelectedStatus] = useState(() => {
    return statusList.find(status => status.code === currentTask.status.code) || statusList[0];

  });
  const [startDate, setStartDate] = useState<Date | null>(currentTask.start || null);
  const [endDate, setEndDate] = useState<Date | null>(currentTask.end || null);
  const [todos, setTodos] = useState<Todo[]>(currentTask.todoList || []);
  const [participants, setParticipants] = useState<Participant[]>(currentTask.participants || []);

  const sortedParticipants = useMemo(() => {
    if (!participants || participants.length === 0) return [];
    return [...participants].sort((a,b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return 0;
    });
  },[participants]);

  const newTaskId = useRef<string>(generateUniqueId('task')).current;

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef.current]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = currentTask.taskName;
    }

    inputRef.current?.focus();

  }, [currentTask.taskName]);

  const handleUpdateTask = () => {
    const taskNameCheck = inputRef.current?.value.trim();
    if (taskNameCheck && startDate && endDate) {
      updateTask(currentTask.taskId, {
        sectionId: selectedSection.sectionId,
        taskName: taskNameCheck,
        start: startDate,
        end: endDate,
        priority: selectedPriority,
        status: selectedStatus,
        todoList: todos,
        participants: participants,
      });
      onClose();
    } else {
      if (!taskNameCheck) inputRef.current?.focus();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpenParticipantModal) return;
      const path = e.composedPath();
      if (cardRef.current && !path.includes(cardRef.current)) {
        handleUpdateTask();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleUpdateTask]);

  // 작업 값 변경
  const handleDateSelect = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleSectionSelect = (section: Section) => setSelectedSection(section);
  const handlePrioritySelect = (priority: SelectOption) => setSelectedPriority(priority);
  const handleStatusSelect = (status: SelectOption) => setSelectedStatus(status);
  const handleTodosChange = (updatedTodos: Todo[]) => setTodos(updatedTodos);

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUpdateTask();
    }
  };

  const handleParticipants = (participants: Participant[]) => {
    setParticipants(participants);
  }

  return (
    <div ref={cardRef} className="edit-task-content" style={{ display: 'contents' }}>

      <SectionSelector selectedSection={selectedSection} onSectionSelect={handleSectionSelect} />

      <input
        type="text"
        ref={inputRef}
        className="new-task-name-input"
        placeholder="작업명 입력"
        onKeyDown={handleInputSubmit}
      />

      <DatePickerTrigger startDate={startDate} endDate={endDate} onDateSelect={handleDateSelect} />

      <div className="card-meta">
        <div className="card-priority-status">
          <OptionSelector options={prioritySelect} selectedOption={selectedPriority} onSelect={handlePrioritySelect} />
          <OptionSelector options={statusList} selectedOption={selectedStatus} onSelect={handleStatusSelect} />
        </div>
      </div>

      <div className="update-card__participants">
        {sortedParticipants.map(user => (
          <AvatarItem
            key={user.id}
            size={24}
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

      <TodoListEditor initialTodos={todos} onTodosChange={handleTodosChange} newTaskId={newTaskId} />
      {isOpenParticipantModal && (
        <ParticipantSelector
          initialParticipants={participants} onClose={() => setIsOpenParticipantModal(false)} onConfirm={handleParticipants}
        />)}
    </div>
  );
};

export default UpdateCard;