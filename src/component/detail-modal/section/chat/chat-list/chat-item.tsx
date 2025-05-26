import { useMemo, useState } from "react";
import { Chat } from "../../../../../types/type";
import { formatTimeToHHMM } from "../../../../../utils/date-function";
import { getInitial } from "../../../../../utils/text-function";
import AvatarItem from "../../../../avatar/avatar";
import ChatDropdownMenu from "./chat-dropdown-menu";
import useChatStore from "../../../../../store/chat-store";

const ChatItem: React.FC<{
  chat: Chat;
  isLikedByCurrentUser: boolean;
  onUpdate: (chatId: string, update: Partial<Chat>) => void;
  currentUserId: string;
  depth?: number;
  taskId: string;
  handleReplyId: (parentId: string, username: string) => void;
  onStartEdit: (chatToEdit: Chat) => void;
}> = ({ chat, isLikedByCurrentUser, onUpdate, currentUserId, depth = 0, taskId, handleReplyId, onStartEdit }) => {
  const deleteChat = useChatStore(state => state.deleteChat);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const SOLID_HEART_PATH = useMemo(() => "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z", []);
  const OUTLINE_HEART_PATH = useMemo(() => "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z", []);

  const handleLikeToggle = () => {
    const currentLikedUserIds = chat.likedUserIds || [];
    let newLikedUserIds;

    if (isLikedByCurrentUser) {
      newLikedUserIds = currentLikedUserIds.filter(id => id !== currentUserId);
    } else {
      newLikedUserIds = [...currentLikedUserIds, currentUserId];
    }
    onUpdate(chat.chatId, { likedUserIds: newLikedUserIds });
  };

  const itemStyle = useMemo(() => ({
    paddingLeft: depth > 0 ? '48px' : undefined,
  }), [depth]);

  const checkIsLikedByCurrentUserForReply = (chatLikeList: string[]) => chatLikeList.includes(currentUserId);

  const isMyComment = currentUserId === chat.user.id;

  const handleEditClick = () => {
    onStartEdit(chat);
  };

  const handleDeleteComment = () => {
    deleteChat(chat.taskId, chat.chatId);
  };


  return (
    <>
      <div className="task-detail__detail-modal-chat-item" style={itemStyle}>
        <AvatarItem size={40}>{getInitial(chat.user.username)}</AvatarItem>
        <div className="task-detail__detail-modal-chat-content">
          <div className="task-detail__detail-modal-chat-header">
            <div className="task-detail__detail-modal-chat-user-info">
              <div>{chat.user.username}</div>
              <div>{formatTimeToHHMM(chat.createdAt)}</div>
            </div>
            {isMyComment && (
              <ChatDropdownMenu onEdit={handleEditClick} onDelete={handleDeleteComment} />
            )}
          </div>
          <div className="task-detail__detail-modal-chat-text">{chat.chatContent}</div>
          <div className="task-detail__detail-modal-chat-reply-button" onClick={() => handleReplyId(chat.chatId, chat.user.username)}>답글 달기</div>
          {chat.replies && chat.replies.length > 0 && (
            <div className="task-detail__detail-modal-chat-replies" onClick={() => setIsExpanded(prev => !prev)}>
              <div />
              <div>{isExpanded ? '답글 닫기' : `답글 ${chat.replies.length}개 더보기`}</div>
            </div>
          )}
        </div>
        <div className="task-detail__detail-modal-chat-like">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="16px"
            viewBox="0 0 24 24"
            width="16px"
            fill={isLikedByCurrentUser ? '#EF4444' : '#1f1f1f'}
            onClick={handleLikeToggle}
          >
            <path d={`${isLikedByCurrentUser ? SOLID_HEART_PATH : OUTLINE_HEART_PATH}`} />
          </svg>
          <span className="task-detail__detail-modal-chat-like-count">{chat.likedUserIds.length}</span>
        </div>
      </div>
      {isExpanded && chat.replies && chat.replies.length > 0 &&
        (<div className="task-detail__detail-modal-chat-replies-container"> {/* 답글들을 감싸는 컨테이너 (선택사항) */}
          {chat.replies.map(reply => (
            <ChatItem
              key={reply.chatId}
              chat={reply}
              isLikedByCurrentUser={checkIsLikedByCurrentUserForReply(reply.likedUserIds || [])}
              onUpdate={onUpdate}
              currentUserId={currentUserId}
              depth={depth + 1}
              taskId={taskId}
              handleReplyId={handleReplyId}
              onStartEdit={onStartEdit}
            />
          ))}
        </div>)}
    </>
  );
};

export default ChatItem;