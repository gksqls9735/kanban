import { useCallback, useMemo, useRef, useState } from "react";

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
import { Chat, Participant, Section, SelectOption, Task, Todo, User } from "../../types/type";
import useSectionsStore from "../../store/sections-store";
import useStatusesStore from "../../store/statuses-store";
import useUserStore from "../../store/user-store";
import useTaskStore from "../../store/task-store";
import { useKanbanActions } from "../../context/task-action-context";
import { priorityMedium, prioritySelect } from "../../mocks/select-option-mock";
import SectionSelector from "../common/selector/section-selector";
import OptionSelector from "../common/selector/option-selector";
import ParticipantSelector from "../participant-select/participant-selector";
import UserProfile from "../common/profile/user-profile";
import useChatStore from "../../store/chat-store";

const DetailModal: React.FC<{
  task: Task;
  onClose: (e: React.MouseEvent) => void;
  openDeleteModal: (e: React.MouseEvent) => void;
  detailModalTopPx: number;
}> = ({ task: initialTaskFromProp, onClose, openDeleteModal, detailModalTopPx }) => {
  // 리사이즈 설정
  const [modalWidth, setModalWidth] = useState(720);
  const isResizing = useRef<boolean>(false);

  const [openProfile, setOpenProfile] = useState<Participant | User | null>(null);

  const handleOpenProfile = (e: React.MouseEvent, user: Participant | User | null) => {
    e.stopPropagation();
    setOpenProfile(user);
  };

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

  // 채팅
  const addChat = useChatStore(state => state.addChat);
  const updateChat = useChatStore(state => state.updateChat);
  const deleteChat = useChatStore(state => state.deleteChat);

  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

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
    const updatedTask = updateTask(currentTask.taskId, { ...updates });
    if (onTasksChange && updatedTask && updatedTask.length > 0) onTasksChange(updatedTask);
  };

  const handleSectionChange = (section: Section) => handleChangeAndNotify({ sectionId: section.sectionId });
  const handleParticipantsUpdate = (newParticipants: Participant[]) => handleChangeAndNotify({ participants: newParticipants });
  const handleDeleteParticipant = (userId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
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
      <TextField key="text" text={currentTask.memo} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={handleChangeAndNotify} />,
      <NumericFieldComponent key="num" numericField={currentTask.numericField} taskId={currentTask.taskId} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={handleChangeAndNotify} />,
      <IdField key="id" prefix={currentTask.prefix} taskId={currentTask.taskId} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={handleChangeAndNotify} />,
      <EmailField key="email" emails={currentTask.emails} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={handleChangeAndNotify} />,
      <UserField key="user" users={currentTask.participants} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={handleChangeAndNotify} onClick={handleOpenProfile} />,
    ].filter(Boolean);
    return isExpanded ? allFields : allFields.slice(0, 3);
  }, [currentTask, isExpanded, isOwnerOrParticipant, handleChangeAndNotify, handleOpenProfile]);


  // 스크롤 함수 정의
  // 특정 요소가 스크롤 영역 안에 보이도록 스크롤하기
  const scrollToElement = useCallback((elementOrChatId: HTMLElement | null | string) => {
    let targetElement: HTMLElement | null = null;
    if (typeof elementOrChatId === 'string') {
      targetElement = document.querySelector(`[data-chat-id="${elementOrChatId}"]`);
    } else {
      targetElement = elementOrChatId;
    }

    if (targetElement && chatScrollContainerRef.current) {
      requestAnimationFrame(() => {
        if (chatScrollContainerRef.current) targetElement!.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    } else {
      console.warn("scrollToElement: Target element or scroll container not found for ID/element:", elementOrChatId, chatScrollContainerRef.current);
    }
  }, []);

  // 채팅 목록의 맨 아래로 스크롤하는 함수
  const scrollToBottom = useCallback(() => {
    if (chatScrollContainerRef.current) {
      requestAnimationFrame(() => {
        if (chatScrollContainerRef.current) {
          chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
        }
      });
    }
  }, []);

  const handleChatSent = useCallback((sentChatId: string, parentChatId: string | null, isNewCommentAdded: boolean) => {
    requestAnimationFrame(() => {
      if (isNewCommentAdded) {
        if (parentChatId === null) {
          scrollToBottom();
        } else {
          scrollToElement(parentChatId);
        }
      }
    });
  }, [scrollToBottom, scrollToElement]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="task-detail__detail-modal-wrapper" onClick={(e) => e.stopPropagation()} style={{ width: modalWidth, top: detailModalTopPx }}>
        <div
          className="task-detail__detail-modal-resizer"
          onMouseDown={handleMouseDown}
        />
        <DetailHeader onClose={onClose} openDeleteModal={openDeleteModal} isOwnerOrParticipant={isOwnerOrParticipant} />
        <div className="task-detail__detail-modal-content kanban-scrollbar-y" ref={chatScrollContainerRef}>

          {/** 작업 설명(TITLE) */}
          <div className="task-detail__detail-modal-section">
            <SectionSelector selectedSection={derivedSelectedSection} onSectionSelect={handleSectionChange} isOwnerOrParticipant={isOwnerOrParticipant} />
            <div className="task-detail__detail-modal-title-info-name">{currentTask.taskName}</div>
            <div className="task-detail__detail-modal-title-info-name-description">{currentTask.memo}</div>
          </div>

          {/** 작업 정보 */}
          <div className="task-detail__detail-modal-section">
            <ReporterField userIcon={currentUser!.icon} userName={currentUser!.username} onClick={(e) => handleOpenProfile(e, currentUser!)} />

            <ParticipantsField
              participants={sortedParticipants}
              onDeleteParticipant={handleDeleteParticipant}
              onAddParticipantClick={() => setIsOpenParticipantModal(true)}
              isOwnerOrParticipant={isOwnerOrParticipant}
              onClick={handleOpenProfile}
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

          {/** 채팅 */}
          <ChatList
            currentUser={currentUser!}
            taskId={currentTask.taskId}
            handleReplyId={handleReplyId}
            onStartEditComment={handleStartEditComment}
            onClick={handleOpenProfile}
            scrollToElement={scrollToElement}
            onUpdate={updateChat}
            onDelete={deleteChat}
          />
        </div>
        <ChatInput
          taskId={currentTask.taskId} parentChat={reply} onClose={handleCancelReply}
          editingChat={editingChatInfo} onFinishEdit={handleChatEditFinish} onClick={handleOpenProfile} onChatSent={handleChatSent}
          addChat={addChat} updateChat={updateChat}
        />
      </div>
      {
        isOpenParticipantModal && (
          <ParticipantSelector
            initialParticipants={currentTask.participants || []} onClose={() => setIsOpenParticipantModal(false)} onConfirm={handleParticipantsUpdate}
          />)
      }
      {openProfile && (<UserProfile user={openProfile} onClose={() => setOpenProfile(null)} />)}
    </div>
  );
};

export default DetailModal;