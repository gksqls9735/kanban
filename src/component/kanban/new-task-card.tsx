import { priorityMedium, prioritySelect } from "../../mocks/select-option-mock";
import useStatusesStore from "../../store/statuses-store";
import useSectionsStore from "../../store/sections-store";
import { useEffect, useRef, useState } from "react";
import useViewModeStore from "../../store/viewmode-store";
import { ViewModes } from "../../constants";
import { Section, SelectOption, Task, Todo } from "../../types/type";
import AvatarGroup from "../avatar/avatar-group";
import { user1 } from "../../mocks/user-mock";
import useTaskStore from "../../store/task-store";
import TodoListEditor from "./new-card/todolist-editor";
import OptionSelector from "./new-card/option-selector";
import DatePickerTrigger from "./new-card/datepicker-trigger";
import SectionSelector from "./new-card/section-selector";

const NewTaskCard: React.FC<{
  columnId: string;
  onClose: () => void;
}> = ({ columnId, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore(state => state.addTask);
  const statusList = useStatusesStore(state => state.statusList);
  const sections = useSectionsStore(state => state.sections);
  const viewMode = useViewModeStore(state => state.viewMode);

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

  const newTaskId = useRef<string>(`task-${Date.now()}-${Math.random().toString(36).substring(7)}`).current;

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

  const handleAddTask = () => {
    const taskNameCheck = inputRef.current?.value.trim();
    if (taskNameCheck && startDate && endDate) {
      const newTask: Task = {
        sectionId: selectedSection.sectionId,
        taskId: newTaskId,
        taskName: taskNameCheck,
        taskOwner: user1, // 실제 사용자로 변경
        start: startDate,
        end: endDate,
        priority: selectedPriority,
        status: selectedStatus,
        importance: 1,
        progress: 0,
        todoList: todos,
        dependencies: [],
        participants: [],
        color: '',
        order: 9999,
        taskAttachments: [],
        urls: [],
        emails: [],
        prefix: '',
      }
      addTask(newTask);
      onClose();
    } else {
      if (!taskNameCheck) inputRef.current?.focus();
    }
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    }
  };

  return (
    <>
      <div className="kanban-card relative">

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

        <div><AvatarGroup list={[]} maxVisible={0} /></div>

        <div className="seperation-line" />

        <TodoListEditor initialTodos={todos} onTodosChange={handleTodosChange} newTaskId={newTaskId} />
      </div>
    </>
  );
};

export default NewTaskCard;