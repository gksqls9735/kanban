import { useEffect, useRef, useState } from "react";
import useUserStore from "../../store/user-store";
import useTaskStore from "../../store/task-store";
import useStatusesStore from "../../store/statuses-store";
import useSectionsStore from "../../store/sections-store";
import useViewModeStore from "../../store/viewmode-store";
import { useKanbanActions } from "../../context/task-action-context";
import { useToast } from "../../context/toast-context";
import { Participant, Section, SelectOption, Task, Todo } from "../../types/type";
import { ViewModes } from "../../constant/constants";
import { priorityMedium } from "../../mocks/select-option-mock";
import { generateUniqueId, normalizeSpaces } from "../../utils/text-function";

interface UseNewTaskCardProps {
  columnId: string;
  onClose: (closedId: string) => void;
  newCardId: string;
  isDropdownOpen: boolean;
}

export const useNewTaskCard = ({
  columnId, onClose, newCardId, isDropdownOpen
}: UseNewTaskCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const statusList = useStatusesStore(state => state.statusList);
  const sections = useSectionsStore(state => state.sections);
  const viewMode = useViewModeStore(state => state.viewMode);
  const currentUser = useUserStore(state => state.currentUser);

  const addTask = useTaskStore(state => state.addTask);
  const { showToast } = useToast();
  const { onTaskAdd } = useKanbanActions();

  const [isOpenParticipantModal, setIsOpenParticipantModal] = useState<boolean>(false);
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
      showToast('작업명을 입력해주세요.');
      inputRef.current.focus();
      return;
    }

    if (!startDate) {
      showToast('시작일을 선택해주세요.');
      return;
    }

    if (currentUser) {
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
      if (isDropdownOpen || isOpenParticipantModal) return;
      const path = e.composedPath();
      if (cardRef.current && !path.includes(cardRef.current)) {
        handleAddTask();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleAddTask, isDropdownOpen, isOpenParticipantModal]);

  return {
    cardRef, inputRef, newTaskId,
    statusList, 
    selectedSection, selectedPriority, selectedStatus,
    startDate, endDate, todos, participants,
    isOpenParticipantModal, setIsOpenParticipantModal,
    handleDateSelect, handleSectionSelect, handlePrioritySelect, handleStatusSelect, handleTodosChange, handleParticipants,
    handleInputSubmit
  }
};
