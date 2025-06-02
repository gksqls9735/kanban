import { Chat, Participant, Section, SelectOption, Task, Todo } from "../../types/type";
import { useMemo, useRef, useState } from "react";
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
import useTaskStore from "../../store/task-store";
import ChatList from "./section/chat/chat-list/chat-list";
import ChatInput from "./section/chat/chat-input";
import { useKanbanActions } from "../../context/task-action-context";

const DetailModal: React.FC<{
  task: Task;
  onClose: (e: React.MouseEvent) => void;
  openDeleteModal: (e: React.MouseEvent) => void;
}> = ({ task: initialTaskFromProp, onClose, openDeleteModal }) => {
  // 리사이즈 설정
  const [modalWidth, setModalWidth] = useState(720);
  const isResizing = useRef<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';

    const startX = e.clientX;
    const startWidth = modalWidth;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = startWidth + (startX - e.clientX);
      if (newWidth >= 720 && newWidth <= 1200) {
        setModalWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };


  const sections = useSectionsStore(state => state.sections);
  const statusList = useStatusesStore(state => state.statusList);
  const currentUser = useUserStore(state => state.currentUser);
  const tasksFromStore = useTaskStore(state => state.allTasks);
  const updateTask = useTaskStore(state => state.updateTask);
  const { onTasksChange } = useKanbanActions();

  const currentTask = useMemo(() => {
    const taskFromStore = tasksFromStore.find(t => t.taskId === initialTaskFromProp.taskId);
    const taskToUse = taskFromStore || initialTaskFromProp;
    return {
      ...taskToUse,
      participants: taskToUse.participants || [],
      todoList: taskToUse.todoList || [],
      urls: taskToUse.urls || [],
      memo: taskToUse.memo || "",
      taskAttachments: taskToUse.taskAttachments || [],
      multiSelection: taskToUse.multiSelection || [],
      singleSelection: taskToUse.singleSelection || [],
      emails: taskToUse.emails || [],
      prefix: taskToUse.prefix || "",
      priority: taskToUse.priority || priorityMedium,
      importance: taskToUse.importance || 0,
      status: statusList.find(s => s.code === taskToUse.status?.code) || taskToUse.status || statusList[0],
    };
  }, [tasksFromStore, initialTaskFromProp, statusList]);

  const [isOpenParticipantModal, setIsOpenParticipantModal] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [reply, setReply] = useState<{ parentId: string; username: string; } | null>(null);
  const [editingChatInfo, setEditingChatInfo] = useState<{
    chatId: string; content: string; parentChatId: string | null; taskId: string;
  } | null>(null);

  // 현재 작업 값 설정
  const derivedSelectedSection = useMemo(() => {
    return sections.find(sec => sec.sectionId === currentTask.sectionId) || sections[0];
  }, [sections, currentTask.sectionId]);

  const derivedSelectedPriority = useMemo(() => {
    return prioritySelect.find(p => p.code === currentTask.priority.code) || currentTask.priority || prioritySelect[0];
  }, [currentTask.priority]);

  const derivedSelectedStatus = useMemo(() => {
    return statusList.find(s => s.code === currentTask.status.code) || currentTask.status || statusList[0];
  }, [statusList, currentTask.status]);


  // 어차피 메인은 한명이기 때문에 다 sort로 하는것보다는 isMain하나만 앞에 두고 나머지를 뒤에 추가하는게?
  const sortedParticipants = useMemo(() => {
    if (!currentTask.participants || currentTask.participants.length === 0) return [];
    return [...currentTask.participants].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return 0;
    });
  }, [currentTask.participants]);

  const isOwnerOrParticipant = currentTask.taskOwner.id === currentUser?.id ||
    currentTask.participants.some(p => p.id === currentUser?.id);

  // 답글 설정
  const handleCancelReply = () => setReply(null);
  const handleReplyId = (parentId: string, username: string) => {
    setReply({ parentId, username });
    if (editingChatInfo) setEditingChatInfo(null);
  }

  // ChatItem에서 수정 시작 시 호출 될 함수
  const handleStartEditComment = (chatToEdit: Chat) => {
    setEditingChatInfo({
      chatId: chatToEdit.chatId,
      content: chatToEdit.chatContent,
      parentChatId: chatToEdit.parentChatId,
      taskId: chatToEdit.taskId,
    });
    if (reply) setReply(null);
  };

  const handleChatEditFinish = () => {
    setEditingChatInfo(null);
  };


  // 값 업데이트
  const handleChangeAndNotify = (updates: Partial<Task>) => {
    if (!currentTask) return;
    updateTask(currentTask.taskId, { ...updates });
    const taskToSendToParent = { ...currentTask, ...updates };
    if (onTasksChange) onTasksChange([taskToSendToParent]);
  };

  const handleSectionChange = (section: Section) => handleChangeAndNotify({ sectionId: section.sectionId });
  const handleParticipantsUpdate = (newParticipants: Participant[]) => handleChangeAndNotify({ participants: newParticipants });
  const handleDeleteParticipant = (userId: string | number) => {
    const updatedParticipants = (currentTask.participants || []).filter(u => u.id !== userId);
    handleChangeAndNotify({ participants: updatedParticipants });
  };
  const handlePriorityChange = (priority: SelectOption) => handleChangeAndNotify({ priority: priority });
  const handleStatusChange = (status: SelectOption) => handleChangeAndNotify({ status: status });
  const handleImportanceValueChange = (newImportance: number) => handleChangeAndNotify({ importance: newImportance });
  const handleTodoListUpdate = (updatedTodoList: Todo[]) => handleChangeAndNotify({ todoList: updatedTodoList });

  const visibleFieldComponents = useMemo(() => {
    const allFields = [
      <UrlField key="url" urls={currentTask.urls} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={handleChangeAndNotify} />,
      <MultiSelection key="multi" options={currentTask.multiSelection} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={handleChangeAndNotify} />,
      <AttachmentField key="attach" attachments={currentTask.taskAttachments} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={handleChangeAndNotify} />,
      <SingleSelection key="single" options={currentTask.singleSelection} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={handleChangeAndNotify} />,
      <TextField key="text" text={currentTask.memo} isOwnerOrParticipant={isOwnerOrParticipant} />,
      <NumericFieldComponent key="num" numericField={currentTask.numericField} taskId={currentTask.taskId} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={handleChangeAndNotify} />,
      <IdField key="id" prefix={currentTask.prefix} taskId={currentTask.taskId} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={handleChangeAndNotify} />,
      <EmailField key="email" emails={currentTask.emails} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={handleChangeAndNotify} />,
      <UserField key="user" users={currentTask.participants} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={handleChangeAndNotify} />,
    ].filter(Boolean);
    return isExpanded ? allFields : allFields.slice(0, 3);
  }, [currentTask, isExpanded, isOpenParticipantModal]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="task-detail__detail-modal-wrapper" onClick={(e) => e.stopPropagation()} style={{ width: modalWidth }}>
        <div
          className="task-detail__detail-modal-resizer"
          onMouseDown={handleMouseDown}
        />
        <DetailHeader onClose={onClose} openDeleteModal={openDeleteModal} isOwnerOrParticipant={isOwnerOrParticipant} />
        <div className="task-detail__detail-modal-content kanban-scrollbar-y ">

          {/** 작업 설명(TITLE) */}
          <div className="task-detail__detail-modal-section">
            <SectionSelector selectedSection={derivedSelectedSection} onSectionSelect={handleSectionChange} isOwnerOrParticipant={isOwnerOrParticipant} />
            <div className="task-detail__detail-modal-title-info-name">{currentTask.taskName}</div>
            <div className="task-detail__detail-modal-title-info-name-description">{currentTask.memo}</div>
          </div>

          {/** 작업 정보 */}
          <div className="task-detail__detail-modal-section">
            <ReporterField userName={currentUser!.username} />

            <ParticipantsField
              participants={sortedParticipants}
              onDeleteParticipant={handleDeleteParticipant}
              onAddParticipantClick={() => setIsOpenParticipantModal(true)}
              isOwnerOrParticipant={isOwnerOrParticipant}
            />

            <DateField label="시작일" date={currentTask.start} />
            <DateField label="마감일" date={currentTask.end} />

            <div className="task-detail__detail-modal-info-row">
              <div className="task-detail__detail-modal-info-value--select-option">우선순위</div>
              <OptionSelector options={prioritySelect} selectedOption={derivedSelectedPriority} onSelect={handlePriorityChange} isOwnerOrParticipant={isOwnerOrParticipant} />
            </div>

            <div className="task-detail__detail-modal-info-row">
              <div className="task-detail__detail-modal-info-value--select-option">상태</div>
              <OptionSelector options={statusList} selectedOption={derivedSelectedStatus} onSelect={handleStatusChange} isOwnerOrParticipant={isOwnerOrParticipant} />
            </div>

            <ImportanceField initialValue={currentTask.importance} onChange={handleImportanceValueChange} isOwnerOrParticipant={isOwnerOrParticipant} />

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
          <DetailTodoList initialTodoList={currentTask.todoList || []} onTodoListUpdate={handleTodoListUpdate} taskId={currentTask.taskId} isOwnerOrParticipant={isOwnerOrParticipant} />

          {/** 채팅팅 */}
          <ChatList currentUser={currentUser!} taskId={currentTask.taskId} handleReplyId={handleReplyId} onStartEditComment={handleStartEditComment} />
        </div>
        <ChatInput
          taskId={currentTask.taskId} parentChat={reply} onClose={handleCancelReply}
          editingChat={editingChatInfo} onFinishEdit={handleChatEditFinish} />
      </div>
      {
        isOpenParticipantModal && (
          <ParticipantSelector
            initialParticipants={currentTask.participants || []} onClose={() => setIsOpenParticipantModal(false)} onConfirm={handleParticipantsUpdate}
          />)
      }
    </div>
  );
};

export default DetailModal;