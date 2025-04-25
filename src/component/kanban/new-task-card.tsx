import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { priorityMedium, prioritySelect } from "../../mocks/select-option-mock";
import { lightenColor } from "../../utils/color-function";
import useStatusesStore from "../../store/statuses-store";
import useSectionsStore from "../../store/sections-store";
import { useEffect, useRef, useState } from "react";
import useViewModeStore from "../../store/viewmode-store";
import { ViewModes } from "../../constants";
import { Section, SelectOption, Task, Todo } from "../../types/type";
import AvatarGroup from "../avatar/avatar-group";
import DateTimePicker from "./datetime-picker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { user1 } from "../../mocks/user-mock";
import EditableTodoItem from "./card-todo/editable-todo";
import useTaskStore from "../../store/task-store";

const NewTaskCard: React.FC<{
  columnId: string;
  onClose: () => void;
}> = ({ columnId, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore(state => state.addTask);
  const statusList = useStatusesStore(state => state.statusList);
  const sections = useSectionsStore(state => state.sections);
  const viewMode = useViewModeStore(state => state.viewMode);

  const [openDropdown, setOpenDropdown] = useState<'date' | 'section' | 'priority' | 'status' | null>(null);
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
  const [focusedTodoId, setFocusedTodoId] = useState<string | null>(null);

  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerDropdownRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const sectionDropdownRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const newTaskId = `task-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const handleAddTodo = () => {
    const newTodoId = `new-todo-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newTodo: Todo = {
      taskId: newTaskId,
      todoId: newTodoId,
      todoOwner: user1.username, // 실제 사용자로 변경하기
      isCompleted: false,
      todoTxt: '',
      todoDt: new Date(),
      participants: [],
      order: todos.length,
    };
    setTodos(prev => [...prev, newTodo]);
    setFocusedTodoId(newTodoId);
  };

  const handleTodoChange = (todoId: string, updatedTodo: Partial<Pick<Todo, 'todoTxt' | 'isCompleted'>>) => {
    setTodos(prev =>
      prev.map(todo => todo.todoId === todoId ? { ...todo, ...updatedTodo } : todo));
    if (focusedTodoId === todoId) setFocusedTodoId(null);
  };

  const handleDeleteTodo = (todoId: string) => {
    setTodos(prev => prev.filter(todo => todo.todoId !== todoId));
    if (focusedTodoId === todoId) setFocusedTodoId(null);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef.current]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const path = e.composedPath();
      if (openDropdown === 'date') {
        const isClickInsideDatePicker =
          (pickerRef.current && path.includes(pickerRef.current)) ||
          (pickerDropdownRef.current && path.includes(pickerDropdownRef.current));
        if (!isClickInsideDatePicker) setOpenDropdown(null);
      } else if (openDropdown === 'section') {
        const isClickInsideSection =
          (sectionRef.current && path.includes(sectionRef.current)) ||
          (sectionDropdownRef.current && path.includes(sectionDropdownRef.current));
        if (!isClickInsideSection) setOpenDropdown(null);
      } else if (openDropdown === 'priority') {
        const isClickInsidePriority =
          (priorityRef.current && path.includes(priorityRef.current)) ||
          (priorityDropdownRef.current && path.includes(priorityDropdownRef.current));
        if (!isClickInsidePriority) setOpenDropdown(null);
      } else if (openDropdown === 'status') {
        const isClickInsideStatus =
          (statusRef.current && path.includes(statusRef.current)) ||
          (statusDropdownRef.current && path.includes(statusDropdownRef.current));
        if (!isClickInsideStatus) setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const handlePickerClick = () => setOpenDropdown(openDropdown === 'date' ? null : 'date');
  const handleSectionClick = () => setOpenDropdown(openDropdown === 'section' ? null : 'section');
  const handlePriorityClick = () => setOpenDropdown(openDropdown === 'priority' ? null : 'priority');
  const handleStatusClick = () => setOpenDropdown(openDropdown === 'status' ? null : 'status');

  const handleDateSelect = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section);
    setOpenDropdown(null);
  };

  const handlePrioritySelect = (priority: SelectOption) => {
    setSelectedPriority(priority);
    setOpenDropdown(null);
  };

  const handleStatusSelect = (status: SelectOption) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return '';
    return format(date, 'yyyy.MM.dd', { locale: ko }); // 예: 03.15
  };

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
    }
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <>
      <div className="kanban-card relative">
        <div className="relative">
          <div ref={sectionRef} className="card-current-section" onClick={handleSectionClick}>
            {selectedSection.sectionName}
            <FontAwesomeIcon icon={faCaretDown} style={{ width: 12, height: 12 }} />
          </div>
          {openDropdown === 'section' && (
            <div ref={sectionDropdownRef} className="select-dropdown-panel section-dropdown-panel">
              {sections.map(sec => (
                <div key={sec.sectionId} className="select-dropdown-item" onClick={() => handleSectionSelect(sec)}>
                  {sec.sectionName}
                </div>
              ))}
            </div>
          )}
        </div>

        <input type="text"
          ref={inputRef}
          className="new-task-name-input"
          placeholder="작업명 입력" 
          onKeyDown={handleInputSubmit}
        />

        <div className="card-datepicker-area">
          <div ref={pickerRef} onClick={handlePickerClick} className="card-datepicker-trigger">
            <div className="card-datepicker-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#7d8998">
                <path d="M360-300q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
              </svg>
            </div>
            <span className="card-datepicker-text">
              {startDate && endDate && startDate.getTime() !== endDate.getTime()
                ? `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`
                : formatDateDisplay(startDate)}
            </span>
          </div>
          {openDropdown === 'date' && (
            <div ref={pickerDropdownRef} className="datepicker-dropdown-panel">
              <DateTimePicker
                initialStartDate={startDate}
                initialEndDate={endDate}
                initialShowDeadline={!!endDate}
                initialIncludeTime={startDate ? startDate.getHours() !== 0 || startDate.getMinutes() !== 0 : false}
                onChange={handleDateSelect}
              />
            </div>
          )}
        </div>

        <div className="card-meta">
          <div className="card-priority-status">
            <div className="card-select-wrapper">
              <div ref={priorityRef} className="card-priority" onClick={handlePriorityClick}
                style={{ color: selectedPriority.colorMain, backgroundColor: selectedPriority.colorSub || lightenColor(selectedPriority.colorMain, 0.85), cursor: 'pointer' }}
              >
                {selectedPriority.name}
                <FontAwesomeIcon icon={faCaretDown} style={{ width: 12, height: 12, marginLeft: 2 }} />
              </div>
              {openDropdown === 'priority' && (
                <div ref={priorityDropdownRef} className="select-dropdown-panel">
                  {prioritySelect.map(p => (
                    <div key={p.code} className="select-dropdown-item" onClick={() => handlePrioritySelect(p)}
                      style={{
                        color: p.colorMain, backgroundColor: selectedPriority.code === p.code ? (p.colorSub || lightenColor(p.colorMain, 0.85)) : '#fff',
                      }}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-select-wrapper">
              <div ref={statusRef} className="card-status" onClick={handleStatusClick}
                style={{ color: selectedStatus.colorMain, backgroundColor: selectedStatus.colorSub || lightenColor(selectedStatus.colorMain, 0.85), cursor: 'pointer' }}
              >
                {selectedStatus.name}
                <FontAwesomeIcon icon={faCaretDown} style={{ width: 12, height: 12, marginLeft: 2 }} />
              </div>
              {openDropdown === 'status' && (
                <div ref={statusDropdownRef} className="select-dropdown-panel">
                  {statusList.map(s => (
                    <div key={s.code} className="select-dropdown-item" onClick={() => handleStatusSelect(s)}
                      style={{
                        color: s.colorMain,
                        backgroundColor: selectedStatus.code === s.code ? (s.colorSub || lightenColor(s.colorMain, 0.85)) : '#fff',
                      }}
                    >
                      {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <AvatarGroup list={[]} maxVisible={0} />
        </div>
        <div className="seperation-line" />

        <div className="card-todolist">
          <div className={`todo-list todo-list--open`} style={{ marginTop: 0 }}>
            {todos.map(todo => (
              <EditableTodoItem
                key={todo.todoId}
                todo={todo}
                onChange={handleTodoChange}
                onDelete={handleDeleteTodo}
                // 현재 포커스 대상 ID와 일치하면 autoFocus prop을 true로 전달
                autoFocus={todo.todoId === focusedTodoId}
              />
            ))}
            <div className="card-add-todo">
              <div onClick={handleAddTodo}>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="#7D8998" className="bi bi-plus-lg" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                </svg>
              </div>
              <div className="card-add-todo__text" onClick={handleAddTodo}>
                할 일 추가
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewTaskCard;