import { Participant, Section, SelectOption, Task, Todo } from "../../types/type";
import { useEffect, useMemo, useState } from "react";
import useSectionsStore from "../../store/sections-store";
import SectionSelector from "../kanban/new-card/section-selector";
import ParticipantSelector from "../participant-select/participant-selector";
import { priorityMedium, prioritySelect } from "../../mocks/select-option-mock";
import useStatusesStore from "../../store/statuses-store";
import OptionSelector from "../kanban/new-card/option-selector";
import useUserStore from "../../store/user-store";
import DetailHeader from "./detail-header";
import ReporterField from "./section/info-field/reporter-field";
import ParticipantsField from "./section/info-field/participants-field";
import DateField from "./section/info-field/date-field";
import ImportanceField from "./section/info-field/importance-field";
import UrlField from "./section/field/url-field";
import MultiSelection from "./section/field/multi-selection-field";
import AttachmentField from "./section/field/attachment-field";
import SingleSelection from "./section/field/single-selection";
import TextField from "./section/field/text-field";
import NumericFieldComponent from "./section/field/numeric-field";
import IdField from "./section/field/id-field";
import EmailField from "./section/field/email-field";
import UserField from "./section/field/user-field";
import DetailTodoList from "./section/detail-todo/detail-todo-list";
import ChatList from "./section/chat/chat-list/chat-list";
import ChatInput from "./section/chat/chat-input";
import useTaskStore from "../../store/task-store";

const DetailModal: React.FC<{
  task: Task;
  onClose: (e: React.MouseEvent) => void;
  openDeleteModal: (e: React.MouseEvent) => void;
}> = ({ task: initialTaskFromProp, onClose, openDeleteModal }) => {
  const sections = useSectionsStore(state => state.sections);
  const statusList = useStatusesStore(state => state.statusList);
  const currentUser = useUserStore(state => state.currentUser);
  const tasksFromStore = useTaskStore(state => state.allTasks);

  const currentTask = useMemo(() => {
    return tasksFromStore.find(t => t.taskId === initialTaskFromProp.taskId) || initialTaskFromProp;
  }, [tasksFromStore, initialTaskFromProp]);

  const [selectedSection, setSelectedSection] = useState<Section>(() => {
    return sections.find(sec => sec.sectionId === currentTask.sectionId) || sections[0];
  });
  const [selectedPriority, setSelectedPriority] = useState<SelectOption>(currentTask.priority || priorityMedium);
  const [selectedStatus, setSelectedStatus] = useState(() => {
    return statusList.find(status => status.code === currentTask.status.code) || statusList[0];
  });
  const [currentImportance, setCurrentImportance] = useState<number>(currentTask.importance || 0);
  const [isOpenParticipantModal, setIsOpenParticipantModal] = useState<boolean>(false);
  const [currentTodoList, setCurrentTodoList] = useState<Todo[]>(currentTask.todoList);
  const [participants, setParticipants] = useState<Participant[]>(currentTask.participants || []);
  const sortedParticipants = useMemo(() => {
    if (!participants || participants.length === 0) return [];
    return [...participants].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return 0;
    });
  }, [participants]);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    setSelectedSection(sections.find(sec => sec.sectionId === currentTask.sectionId) || sections[0]);
    setSelectedPriority(currentTask.priority || priorityMedium);
    setSelectedStatus(statusList.find(status => status.code === currentTask.status.code) || statusList[0]);
    setCurrentImportance(currentTask.importance || 0);
    setParticipants(currentTask.participants || []);
    setCurrentTodoList(currentTask.todoList || []);
  }, [currentTask, sections, statusList]);

  const visibleFieldComponents = useMemo(() => {
    const allFields = [
      currentTask.urls?.length ? <UrlField key="url" urls={currentTask.urls} taskId={currentTask.taskId}/> : null,
      currentTask.multiSelection?.length ? <MultiSelection key="multi" options={currentTask.multiSelection} /> : null,
      currentTask.taskAttachments?.length ? <AttachmentField key="attach" attachment={currentTask.taskAttachments} /> : null,
      currentTask.singleSelection ? <SingleSelection key="single" option={currentTask.singleSelection} /> : null,
      currentTask.memo ? <TextField key="text" text={currentTask.memo} /> : null,
      currentTask.numericField ? <NumericFieldComponent key="num" numericField={currentTask.numericField} /> : null,
      currentTask.prefix ? <IdField key="id" prefix={currentTask.prefix} taskId={currentTask.taskId} /> : null,
      currentTask.emails?.length ? <EmailField key="email" emails={currentTask.emails} taskId={currentTask.taskId} /> : null,
      currentTask.participants?.length ? <UserField key="user" users={currentTask.participants} /> : null,
    ].filter(Boolean);
    return isExpanded ? allFields : allFields.slice(0, 3);
  }, [currentTask, isExpanded]);

  const handleSectionSelect = (section: Section) => setSelectedSection(section);
  const handleParticipants = (newParticipants: Participant[]) => setParticipants(newParticipants);
  const handleDeleteParticipants = (userId: string | number) => {
    const updatedParticipants = participants.filter(u => u.id !== userId);
    setParticipants(updatedParticipants);
  };

  const handlePrioritySelect = (priority: SelectOption) => setSelectedPriority(priority);
  const handleStatusSelect = (status: SelectOption) => setSelectedStatus(status);
  const handleImportanceChange = (newImportance: number) => setCurrentImportance(newImportance);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="task-detail__detail-modal-overlay" onClick={(e) => { e.stopPropagation(); onClose(e); }} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="task-detail__detail-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="task-detail__detail-modal-content">
          <DetailHeader onClose={onClose} openDeleteModal={openDeleteModal} />

          {/** 작업 설명(TITLE) */}
          <div className="task-detail__detail-modal-section">
            <SectionSelector selectedSection={selectedSection} onSectionSelect={handleSectionSelect} />
            <div className="task-detail__detail-modal-title-info-name">{currentTask.taskName}</div>
            <div className="task-detail__detail-modal-title-info-name-description">{currentTask.memo}</div>
          </div>

          {/** 작업 정보 */}
          <div className="task-detail__detail-modal-section">
            <ReporterField userName={currentUser!.username} />

            <ParticipantsField
              participants={sortedParticipants}
              onDeleteParticipant={handleDeleteParticipants}
              onAddParticipantClick={() => setIsOpenParticipantModal(true)}
            />

            <DateField label="시작일" date={currentTask.start} />
            <DateField label="마감일" date={currentTask.end} />

            <div className="task-detail__detail-modal-info-row">
              <div className="task-detail__detail-modal-info-value--select-option">우선순위</div>
              <OptionSelector options={prioritySelect} selectedOption={selectedPriority} onSelect={handlePrioritySelect} />
            </div>

            <div className="task-detail__detail-modal-info-row">
              <div className="task-detail__detail-modal-info-value--select-option">상태</div>
              <OptionSelector options={statusList} selectedOption={selectedStatus} onSelect={handleStatusSelect} />
            </div>

            <ImportanceField initialValue={currentImportance} onChange={handleImportanceChange} />

          </div>

          {/** 작업 필드 */}
          <div className="task-detail__detail-modal-section task-detail__detail-modal-section--field">
            <div className="task-detail__detail-modal-section--field-title">필드</div>
            <ul className="task-detail__detail-modal-field-list">
              {visibleFieldComponents.map((field, idx) => (
                <div key={idx}>{field}</div>
              ))}
              <li className="task-detail__detail-modal-field-item">
                <span onClick={() => setIsExpanded(prev => !prev)} className="task-detail__detail-modal-field-expand-text">
                  {isExpanded ? (<>필드 접기</>) : (<>필드 더보기...</>)}
                </span>
              </li>
            </ul>
          </div>

          {/** 작업 할 일 목록 */}
          <DetailTodoList initialTodoList={currentTodoList} setInitialTodoList={setCurrentTodoList} taskId={currentTask.taskId} />

          {/** 채팅 */}
          <ChatList currentUser={currentUser!} taskId={currentTask.taskId} />
          <ChatInput currentUser={currentUser!} taskId={currentTask.taskId} />
        </div>
      </div>
      {
        isOpenParticipantModal && (
          <ParticipantSelector
            initialParticipants={participants} onClose={() => setIsOpenParticipantModal(false)} onConfirm={handleParticipants}
          />)
      }
    </div>
  );
};

export default DetailModal;