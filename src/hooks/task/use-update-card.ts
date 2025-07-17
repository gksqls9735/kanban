import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Participant, Section, SelectOption, Task } from "../../types/type";
import useTaskStore from "../../store/task-store";
import useStatusesStore from "../../store/statuses-store";
import useSectionsStore from "../../store/sections-store";
import { useKanbanActions } from "../../context/task-action-context";
import { useToast } from "../../context/toast-context";
import { priorityMedium } from "../../mocks/select-option-mock";
import { normalizeSpaces } from "../../utils/text-function";
import { isAfter } from "date-fns";
import { calcMinStart } from "../../utils/date-function";

export interface UseUpdateCard {
  onClose: () => void;
  currentTask: Task;
}

export const useUpdateCard = ({
  onClose, currentTask
}: UseUpdateCard) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const allTasks = useTaskStore(state => state.allTasks);
  const updateTask = useTaskStore(state => state.updateTask);
  const statusList = useStatusesStore(state => state.statusList);
  const sections = useSectionsStore(state => state.sections);
  const { showToast } = useToast();
  const { onTasksChange } = useKanbanActions();

  const [isOpenParticipantModal, setIsOpenParticipantModal] = useState<boolean>(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);

  const [selectedSection, setSelectedSection] = useState<Section>(() => {
    return sections.find(sec => sec.sectionId === currentTask.sectionId) || sections[0];
  });
  const [selectedPriority, setSelectedPriority] = useState<SelectOption>(currentTask.priority || priorityMedium);
  const [selectedStatus, setSelectedStatus] = useState(() => {
    return statusList.find(status => status.code === currentTask.status.code) || statusList[0];

  });
  const [startDate, setStartDate] = useState<Date | null>(currentTask.start || null);
  const [endDate, setEndDate] = useState<Date | null>(currentTask.end || null);
  const [participants, setParticipants] = useState<Participant[]>(currentTask.participants || []);

  const sortedParticipants = useMemo(() => {
    if (!participants || participants.length === 0) return [];
    return [...participants].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return 0;
    });
  }, [participants]);


  const handleUpdateTask = useCallback(() => {
    if (!inputRef.current) return;

    let processedName = inputRef.current?.value;
    processedName = normalizeSpaces(processedName);

    if (!processedName) {
      showToast('작업명을 입력해주세요.');
      inputRef.current?.focus();
      return;
    }

    const finalStartDate = startDate ? startDate : currentTask.start;
    const finalEndDate = endDate;

    if (finalStartDate && finalEndDate && isAfter(finalStartDate, finalEndDate)) {
      showToast('시작일은 마감일보다 이전 날짜여야 합니다.');
      return;
    }

    const updatedTasks = updateTask(currentTask.taskId, {
      sectionId: selectedSection.sectionId,
      taskName: processedName,
      start: finalStartDate,
      end: finalEndDate,
      priority: selectedPriority,
      status: selectedStatus,
      participants: participants,
    });
    if (onTasksChange && updatedTasks.length > 0) {
      if (updatedTasks) onTasksChange(updatedTasks);
    }
    onClose();
  }, [inputRef, startDate, endDate, selectedSection, selectedPriority, selectedStatus, participants, onTasksChange]);

  const handleDateSelect = useCallback((start: Date | null, end: Date | null) => {
    const finalStartDate = start ? start : currentTask.start;
    const finalEndDate = end;

    if (finalStartDate && finalEndDate && isAfter(finalStartDate, finalEndDate)) {
      showToast('시작일은 마감일보다 이전 날짜여야 합니다.');
      return;
    }
    setStartDate(finalStartDate);
    setEndDate(end);
  }, [currentTask.start, setStartDate, setEndDate]);

  const handleSectionSelect = useCallback((section: Section) => setSelectedSection(section), [setSelectedSection]);
  const handlePrioritySelect = useCallback((priority: SelectOption) => setSelectedPriority(priority), [setSelectedPriority]);
  const handleStatusSelect = useCallback((status: SelectOption) => setSelectedStatus(status), [setSelectedStatus]);
  const handleParticipants = useCallback((participants: Participant[]) => setParticipants(participants), [setParticipants]);
  const handleInputSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUpdateTask();
    }
  }, [handleUpdateTask]);


  const getMinStartDateForTask = useCallback((task: Task): Date | null => {
    if (!task || !task.dependencies || task.dependencies.length === 0) return null;

    const resolvedDependencies: Task[] = task.dependencies
      .map(depId => allTasks.find(t => t.taskId === depId))
      .filter((dep): dep is Task => dep !== undefined);

    if (resolvedDependencies.length === 0) return null;

    return calcMinStart(task, resolvedDependencies);
  }, []);

  const minStart = useMemo(() => getMinStartDateForTask(currentTask), [getMinStartDateForTask, currentTask]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = currentTask.taskName;
    inputRef.current?.focus();
  }, [currentTask.taskName]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpenParticipantModal || isDatePickerOpen || isSelectorOpen) return;
      const path = e.composedPath();
      if (cardRef.current && !path.includes(cardRef.current)) handleUpdateTask();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleUpdateTask, isOpenParticipantModal, isDatePickerOpen, isSelectorOpen, cardRef]);

  return {
    cardRef, inputRef, statusList, isOpenParticipantModal, setIsOpenParticipantModal, setIsDatePickerOpen, setIsSelectorOpen,
    selectedSection, selectedPriority, selectedStatus, startDate, endDate, participants, sortedParticipants, minStart,
    handleUpdateTask, handleDateSelect, handleSectionSelect, handlePrioritySelect, handleStatusSelect, handleParticipants, handleInputSubmit,
  };
};