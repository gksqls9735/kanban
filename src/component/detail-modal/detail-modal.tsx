import { useRef, useState } from "react";
import DetailHeader from "./detail-header";
import DetailTodoList from "./section/detail-todo/detail-todo-list";
import ChatList from "./section/chat/chat-list/chat-list";
import ChatInput from "./section/chat/chat-input";
import { Participant, Task, Todo, User } from "../../types/type";
import UserProfile from "../common/profile/user-profile";
import { useResizable } from "../../hooks/detail/use-resizable";
import { useTaskChat } from "../../hooks/detail/use-task-chat";
import { useTaskDetail } from "../../hooks/detail/use-task-detail";
import TaskTitleSection from "./section/detail-todo/component/task-title-section";
import TaskInfoSection from "./section/detail-todo/component/task-info-section";
import TaskFieldsSection from "./section/detail-todo/component/task-fields-section";

const DetailModal: React.FC<{
  task: Task;
  onClose: (e: React.MouseEvent) => void;
  openDeleteModal: (e: React.MouseEvent) => void;
  detailModalTopPx: number;
}> = ({ task: initialTaskFromProp, onClose, openDeleteModal, detailModalTopPx }) => {
  // 리사이즈 설정
  const { width: sidePanelWidth, handleMouseDown } = useResizable(720, 1200, 720);
  // 작업 설정 및 업데이트
  const { task, updateTaskField, isOwnerOrParticipant, currentUser } = useTaskDetail(initialTaskFromProp.taskId);
  if (!task || !currentUser) return null;

  // 채팅
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const {
    reply, editingChatInfo,
    addChat, updateChat, deleteChat,
    handleCancelReply, handleReplyId, handleStartEditComment, handleChatEditFinish, handleChatSent,
    scrollToElement,
  } = useTaskChat(task.taskId, chatScrollContainerRef);

  const [openProfile, setOpenProfile] = useState<Participant | User | null>(null);

  const handleOpenProfile = (e: React.MouseEvent, user: Participant | User | null) => {
    e.stopPropagation();
    setOpenProfile(user);
  };

  const handleTodoListUpdate = (updatedTodoList: Todo[]) => updateTaskField({ todoList: updatedTodoList });


  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="task-detail__detail-modal-wrapper" onClick={(e) => e.stopPropagation()} style={{ width: sidePanelWidth, top: detailModalTopPx }}>
        <div
          className="task-detail__detail-modal-resizer"
          onMouseDown={handleMouseDown}
        />
        <DetailHeader onClose={onClose} openDeleteModal={openDeleteModal} isOwnerOrParticipant={isOwnerOrParticipant} />
        <div className="task-detail__detail-modal-content gantt-scrollbar-y" ref={chatScrollContainerRef}>

          {/** 작업 설명(TITLE) */}
          <TaskTitleSection taskName={task.taskName} memo={task.memo} sectionId={task.sectionId} isOwnerOrParticipant={isOwnerOrParticipant} onUpdate={updateTaskField} />
          {/** 작업 정보 */}
          <TaskInfoSection task={task} currentUser={currentUser} isOwnerOrParticipant={isOwnerOrParticipant} onUpdate={updateTaskField} onOpenProfile={handleOpenProfile} />
          {/** 작업 필드 */}
          <TaskFieldsSection task={task} isOwnerOrParticipant={isOwnerOrParticipant} onUpdate={updateTaskField} onOpenProfile={handleOpenProfile} />
          {/** 작업 할 일 목록 */}
          <DetailTodoList initialTodoList={task.todoList || []} onTodoListUpdate={handleTodoListUpdate} taskId={task.taskId} isOwnerOrParticipant={isOwnerOrParticipant} />
          {/** 채팅 */}
          <ChatList
            currentUser={currentUser}
            onClick={handleOpenProfile}
            taskId={task.taskId}
            handleReplyId={handleReplyId}
            onStartEditComment={handleStartEditComment}
            scrollToElement={scrollToElement}
            onUpdate={updateChat}
            onDelete={deleteChat}
          />
        </div>
        <ChatInput
          taskId={task.taskId} parentChat={reply} onClose={handleCancelReply}
          editingChat={editingChatInfo} onFinishEdit={handleChatEditFinish} onClick={handleOpenProfile} onChatSent={handleChatSent}
          addChat={addChat} updateChat={updateChat}
        />
      </div>
      {openProfile && (<UserProfile user={openProfile} onClose={() => setOpenProfile(null)} />)}
    </div>
  );
};

export default DetailModal;