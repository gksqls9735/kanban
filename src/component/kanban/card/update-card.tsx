import { priorityMedium, prioritySelect } from "../../../mocks/select-option-mock";
import useStatusesStore from "../../../store/statuses-store";
import useSectionsStore from "../../../store/sections-store";
import { useEffect, useMemo, useRef, useState } from "react";
import { Participant, Section, SelectOption, Task, Todo } from "../../../types/type";
import useTaskStore from "../../../store/task-store";
import SectionSelector from "../../common/selector/section-selector";
import DatePickerTrigger from "../new-card/datepicker-trigger";
import OptionSelector from "../../common/selector/option-selector";
import TodoListEditor from "../new-card/todolist-editor";
import AvatarItem from "../../common/avatar/avatar";
import { generateUniqueId, getInitial, normalizeSpaces } from "../../../utils/text-function";
import ParticipantSelector from "../../participant-select/participant-selector";
import { calcMinStart } from "../../../utils/date-function";
import { useKanbanActions } from "../../../context/task-action-context";
import { useToast } from "../../../context/toast-context";

const UpdateCard: React.FC<{
  onClose: () => void;
  currentTask: Task;
}> = ({ onClose, currentTask }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateTask = useTaskStore(state => state.updateTask);
  const statusList = useStatusesStore(state => state.statusList);
  const sections = useSectionsStore(state => state.sections);

  const allTasks = useTaskStore(state => state.allTasks);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);

  const { showToast } = useToast();
  const { onTasksChange } = useKanbanActions();

  const getMinStartDateForTask = (task: Task): Date | null => {
    // 대상 작업이나 작업의 의존성 ID 목록이 없으면 계산할 필요가 없습니다.
    if (!task || !task.dependencies || task.dependencies.length === 0) {
      return null;
    }

    // task.dependencies는 ID 문자열의 배열입니다.
    // allTasks 배열에서 해당 ID를 가진 실제 Task 객체들을 찾습니다.
    const resolvedDependencies: Task[] = task.dependencies
      .map(depId => allTasks.find(t => t.taskId === depId)) // ID로 Task 객체 검색
      .filter((dep): dep is Task => dep !== undefined); // undefined 제거 및 타입 가드

    // 유효한 실제 의존성 작업 객체가 하나도 없다면 minStart를 계산할 수 없습니다.
    if (resolvedDependencies.length === 0) {
      return null;
    }

    // 찾은 실제 의존성 Task 객체들을 사용하여 calcMinStart 호출
    return calcMinStart(task, resolvedDependencies);
  };

  const minStart = getMinStartDateForTask(currentTask);

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
    return [...participants].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return 0;
    });
  }, [participants]);

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
    if (!inputRef.current) return;

    let processedName = inputRef.current?.value;
    processedName = normalizeSpaces(processedName);

    if (processedName && startDate && endDate) {
      const updatedTodos = todos.map(todo => ({
        ...todo, todoTxt: normalizeSpaces(todo.todoTxt),
      }));

      const filteredTodos = updatedTodos.filter(todo => todo.todoTxt !== '');

      const updatedTasks = updateTask(currentTask.taskId, {
        sectionId: selectedSection.sectionId,
        taskName: processedName,
        start: startDate,
        end: endDate,
        priority: selectedPriority,
        status: selectedStatus,
        todoList: filteredTodos,
        participants: participants,
      });
      if (onTasksChange && updatedTasks.length > 0) {
        if (updatedTasks) onTasksChange(updatedTasks);
      }
      onClose();
    } else {
      if (!processedName) {
        showToast('작업명을 입력해주세요.');
        inputRef.current?.focus();
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpenParticipantModal || isDatePickerOpen || isSelectorOpen) return;
      const path = e.composedPath();
      if (cardRef.current && !path.includes(cardRef.current)) {
        handleUpdateTask();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleUpdateTask, isOpenParticipantModal, isDatePickerOpen, isSelectorOpen]);

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
    <div ref={cardRef} className="edit-task-content" style={{ display: 'contents' }} onClick={e => e.stopPropagation()}>

      <SectionSelector selectedSection={selectedSection} onSectionSelect={handleSectionSelect} isOwnerOrParticipant={true} onToggle={setIsSelectorOpen}/>

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

      <TodoListEditor initialTodos={todos} onTodosChange={handleTodosChange} newTaskId={newTaskId} />
      {isOpenParticipantModal && (
        <ParticipantSelector
          initialParticipants={participants} onClose={() => setIsOpenParticipantModal(false)} onConfirm={handleParticipants}
        />)}
    </div>
  );
};

export default UpdateCard;