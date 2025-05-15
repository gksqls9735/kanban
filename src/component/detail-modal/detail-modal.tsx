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

const DetailModal: React.FC<{
  task: Task;
  onClose: (e: React.MouseEvent) => void;
  openDeleteModal: (e: React.MouseEvent) => void;
}> = ({ task, onClose, openDeleteModal }) => {
  const sections = useSectionsStore(state => state.sections);
  const statusList = useStatusesStore(state => state.statusList);
  const currentUser = useUserStore(state => state.currentUser);

  const [selectedSection, setSelectedSection] = useState<Section>(() => {
    return sections.find(sec => sec.sectionId === task.sectionId) || sections[0];
  });
  const [selectedPriority, setSelectedPriority] = useState<SelectOption>(task.priority || priorityMedium);
  const [selectedStatus, setSelectedStatus] = useState(() => {
    return statusList.find(status => status.code === task.status.code) || statusList[0];

  });

  const [currentImportance, setCurrentImportance] = useState<number>(task.importance || 0);

  const [isOpenParticipantModal, setIsOpenParticipantModal] = useState<boolean>(false);
  const [participants, setParticipants] = useState<Participant[]>(task.participants || []);
  const sortedParticipants = useMemo(() => {
    if (!participants || participants.length === 0) return [];
    return [...participants].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return 0;
    });
  }, [participants]);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const visibleFieldComponents = useMemo(() => {
    const allFields = [
      task.urls?.length ? <UrlField key="url" urls={task.urls} /> : null,
      task.multiSelection?.length ? <MultiSelection key="multi" options={task.multiSelection} /> : null,
      task.taskAttachments?.length ? <AttachmentField key="attach" attachment={task.taskAttachments} /> : null,
      task.singleSelection ? <SingleSelection key="single" option={task.singleSelection} /> : null,
      task.memo ? <TextField key="text" text={task.memo} /> : null,
      task.numericField ? <NumericFieldComponent key="num" numericField={task.numericField} /> : null,
      task.prefix ? <IdField key="id" prefix={task.prefix} taskId={task.taskId} /> : null,
      task.emails?.length ? <EmailField key="email" emails={task.emails} /> : null,
      task.participants?.length ? <UserField key="user" users={task.participants} /> : null,
    ].filter(Boolean);
    return isExpanded ? allFields : allFields.slice(0, 3);
  }, [task, isExpanded]);

  const [currentTodoList, setCurrentTodoList] = useState<Todo[]>(task.todoList);

  const handleSectionSelect = (section: Section) => setSelectedSection(section);
  const handleParticipants = (participants: Participant[]) => {
    setParticipants(participants);
  };
  const handleDeleteParticipants = (userId: string | number) => {
    setParticipants(prev =>
      prev.filter(u => u.id !== userId)
    );
  };

  const handlePrioritySelect = (priority: SelectOption) => setSelectedPriority(priority);
  const handleStatusSelect = (status: SelectOption) => setSelectedStatus(status);
  const handleImportanceChange = (newImportance: number) => {
    setCurrentImportance(newImportance);
  };

  useEffect(() => {
    // 모달이 열릴 때 body 스크롤 숨김
    document.body.style.overflow = 'hidden';
    // 모달이 닫힐 때 body 스크롤 복원
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
            <div className="task-detail__detail-modal-title-info-name">{task.taskName}</div>
            <div className="task-detail__detail-modal-title-info-name-description">{task.memo}</div>
          </div>

          {/** 작업 정보 */}
          <div className="task-detail__detail-modal-section">
            <ReporterField userName={currentUser!.username} />

            <ParticipantsField
              participants={sortedParticipants}
              onDeleteParticipant={handleDeleteParticipants}
              onAddParticipantClick={() => setIsOpenParticipantModal(true)}
            />

            <DateField label="시작일" date={task.start} />
            <DateField label="마감일" date={task.end} />

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
          <DetailTodoList initialTodoList={currentTodoList} setInitialTodoList={setCurrentTodoList} taskId={task.taskId}/>
        </div>
      </div >
      {isOpenParticipantModal && (
        <ParticipantSelector
          initialParticipants={participants} onClose={() => setIsOpenParticipantModal(false)} onConfirm={handleParticipants}
        />)}
    </div >
  );
};

export default DetailModal;