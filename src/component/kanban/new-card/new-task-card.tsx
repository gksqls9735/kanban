import { priorityMedium, prioritySelect } from "../../../mocks/select-option-mock";
import useStatusesStore from "../../../store/statuses-store";
import useSectionsStore from "../../../store/sections-store";
import { useEffect, useRef, useState } from "react";
import useViewModeStore from "../../../store/viewmode-store";
import { ViewModes } from "../../../constants";
import { Participant, Section, SelectOption, Task, Todo } from "../../../types/type";
import useTaskStore from "../../../store/task-store";
import TodoListEditor from "./todolist-editor";
import OptionSelector from "../../common/selector/option-selector";
import DatePickerTrigger from "./datepicker-trigger";
import SectionSelector from "../../common/selector/section-selector";
import AvatarItem from "../../common/avatar/avatar";
import { generateUniqueId, getInitial, normalizeSpaces } from "../../../utils/text-function";
import useUserStore from "../../../store/user-store";
import ParticipantSelector from "../../participant-select/participant-selector";
import { useToast } from "../../../context/toast-context";
import { useKanbanActions } from "../../../context/task-action-context";

const NewTaskCard: React.FC<{
  columnId: string;
  onClose: (closedId: string) => void;
  newCardId: string;
}> = ({ columnId, onClose, newCardId }) => {
  const currentUser = useUserStore(state => state.currentUser);

  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore(state => state.addTask);
  const statusList = useStatusesStore(state => state.statusList);
  const sections = useSectionsStore(state => state.sections);
  const viewMode = useViewModeStore(state => state.viewMode);

  const [isOpenParticipantModal, setIsOpenParticipantModal] = useState<boolean>(false);

  const { showToast } = useToast();
  const { onTaskAdd } = useKanbanActions();

  const [selectedSection, setSelectedSection] = useState<Section>(() => {
    if (viewMode === ViewModes.STATUS) {
      return sections[0];
    } else {
      return sections.find(sec => sec.sectionId === columnId) || sections[0];
    }
  });
  const [selectedPriority, setSelectedPriority] = useState<SelectOption>(priorityMedium);
  const [selectedStatus, setSelectedStatus] = useState(() => {
    if (viewMode === ViewModes.STATUS) {
      return statusList.find(sec => sec.code === columnId) || statusList[0];
    } else {
      return statusList.find(status => status.name === '대기') || statusList[0];
    }
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const newTaskId = useRef<string>(generateUniqueId('task')).current;

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef.current]);

  const handleDateSelect = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleSectionSelect = (section: Section) => setSelectedSection(section);
  const handlePrioritySelect = (priority: SelectOption) => setSelectedPriority(priority);
  const handleStatusSelect = (status: SelectOption) => setSelectedStatus(status);
  const handleTodosChange = (updatedTodos: Todo[]) => setTodos(updatedTodos);
  const handleParticipants = (participants: Participant[]) => setParticipants(participants);

  const handleAddTask = () => {
    if (!inputRef.current) return;
    let processedName = inputRef.current?.value;
    processedName = normalizeSpaces(processedName);

    if (!processedName) {
      // showToast('작업명을 입력해주세요.');
      return;
    }

    if (processedName && startDate && currentUser) {
      const updatedTodos = todos.map(todo => ({
        ...todo, todoTxt: normalizeSpaces(todo.todoTxt),
      }));

      const filteredTodos = updatedTodos.filter(todo => todo.todoTxt !== '');

      const currentAllTasks = useTaskStore.getState().allTasks;

      const sectionOrder = currentAllTasks.reduce((max, t) => {
        if (t.sectionId === selectedSection.sectionId) return Math.max(max, t.sectionOrder);
        return max;
      }, 0) + 1;

      const statusOrder = currentAllTasks.reduce((max, t) => {
        if (t.status.code === selectedStatus.code) return Math.max(max, t.statusOrder);
        return max;
      }, 0) + 1;

      const newTask: Omit<Task, 'color'> & { id?: string; } = {
        sectionId: selectedSection.sectionId,
        taskId: newTaskId,
        taskName: processedName,
        taskOwner: currentUser,
        start: startDate,
        end: endDate,
        priority: selectedPriority,
        status: selectedStatus,
        importance: 1,
        progress: 0,
        todoList: filteredTodos,
        dependencies: [],
        participants: participants,
        sectionOrder, statusOrder,
      }
      addTask(newTask);
      if (onTaskAdd) onTaskAdd(newTask);
      showToast('작업이 추가 되었습니다.')
      onClose(newCardId);
    }
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpenParticipantModal) return;
      const path = e.composedPath();
      if (cardRef.current && !path.includes(cardRef.current)) {
        handleAddTask();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleAddTask]);


  return (
    <>
      <div ref={cardRef} className="kanban-card relative">

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <SectionSelector selectedSection={selectedSection} onSectionSelect={handleSectionSelect} isOwnerOrParticipant={true} />
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

        <DatePickerTrigger startDate={startDate} endDate={endDate} onDateSelect={handleDateSelect} />

        <div className="card-meta">
          <div className="card-priority-status">
            <OptionSelector options={prioritySelect} selectedOption={selectedPriority} onSelect={handlePrioritySelect} isOwnerOrParticipant={true} />
            <OptionSelector options={statusList} selectedOption={selectedStatus} onSelect={handleStatusSelect} isOwnerOrParticipant={true} />
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
    </>
  );
};

export default NewTaskCard;