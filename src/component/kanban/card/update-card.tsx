import { priorityMedium, prioritySelect } from "../../../mocks/select-option-mock";
import useStatusesStore from "../../../store/statuses-store";
import useSectionsStore from "../../../store/sections-store";
import { useEffect, useRef, useState } from "react";
import { Participant, Section, SelectOption, Task, Todo } from "../../../types/type";
import AvatarGroup from "../../avatar/avatar-group";
import useTaskStore from "../../../store/task-store";
import SectionSelector from "../new-card/section-selector";
import DatePickerTrigger from "../new-card/datepicker-trigger";
import OptionSelector from "../new-card/option-selector";
import TodoListEditor from "../new-card/todolist-editor";

const UpdateCard: React.FC<{
  onClose: () => void;
  currentTask: Task;
}> = ({ onClose, currentTask }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateTask = useTaskStore(state => state.updateTask);
  const statusList = useStatusesStore(state => state.statusList);
  const sections = useSectionsStore(state => state.sections);

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

  const newTaskId = useRef<string>(`task-${Date.now()}-${Math.random().toString(36).substring(7)}`).current;

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

  return (
    <div ref={cardRef} className="edit-task-content" style={{ display: 'contents' }}>

      <SectionSelector sections={sections} selectedSection={selectedSection} onSectionSelect={handleSectionSelect} />

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

      <div><AvatarGroup list={participants} maxVisible={3} /></div>

      <div className="seperation-line" />

      <TodoListEditor initialTodos={todos} onTodosChange={handleTodosChange} newTaskId={newTaskId} />
    </div>
  );
};

export default UpdateCard;