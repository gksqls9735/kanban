import { useMemo } from "react";
import ChatDropdownMenu from "./chat-dropdown-menu";
import LinkPreview from "../../../common/link-preview";
import { Chat, Participant, User } from "../../../../../types/type";
import AvatarItem from "../../../../common/avatar/avatar";
import { getInitial } from "../../../../../utils/text-function";
import { formatTimeToHHMM } from "../../../../../utils/date-function";
import { ChatForUI } from "../../../../../store/chat-store";
import { useChatItem } from "../../../../../hooks/detail/use-chat-item";
import ChatImgFallback from "../../../../common/chat-img-fallback";
import { getFileTypeInfo } from "../../../common/file-icon";

const SOLID_HEART_PATH = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
const OUTLINE_HEART_PATH = "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z";

const ChatItem: React.FC<{
  chat: ChatForUI;
  onUpdate: (chatId: string, update: Partial<Chat>) => void;
  onDelete: (chatId: string) => void;
  currentUserId: string;
  depth?: number;
  taskId: string;
  handleReplyId: (parentId: string, username: string) => void;
  onStartEdit: (chatToEdit: Chat) => void;
  onClick: (e: React.MouseEvent, user: Participant | User | null) => void;
  scrollToElement: (element: HTMLElement | null | string) => void;
}> = ({ chat, onUpdate, onDelete, currentUserId, depth = 0, taskId, handleReplyId, onStartEdit, onClick, scrollToElement }) => {
  const {
    isExpanded,
    isLikedByCurrentUser,
    isMyComment,
    extractedUrl,
    imgAttachments,
    otherAttachments,
    handleLikeToggle,
    handleEditClick,
    handleDeleteComment,
    handleReplyInfo,
    handleToggleReplies,
  } = useChatItem({ chat, currentUserId, onUpdate, onDelete, onStartEdit, handleReplyId });

  const itemStyle = useMemo(() => ({
    paddingLeft: depth > 0 ? '48px' : undefined,
  }), [depth]);

  return (
    <>
      <div className="task-detail__detail-modal-chat-item" style={itemStyle} data-chat-id={chat.chatId}>
        <div onClick={e => onClick(e, chat.user)}>
          <AvatarItem size={40} src={chat.user.icon}>{getInitial(chat.user.username)}</AvatarItem>
        </div>
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
          {imgAttachments && imgAttachments.length > 0 && (
            <div className="task-detail__detail-modal-chat-attached-files">
              {imgAttachments.map((file, index) => (
                <ChatImgFallback key={`file-${index}`} attachment={file} />
              ))}
            </div>
          )}
          {otherAttachments.length > 0 && (
            <ul className="task-detail__detail-modal-field-content-list">
              {otherAttachments.map(file => {
                const { icon } = getFileTypeInfo(file.fileName, 18);
                return (
                  <li key={file.fileId} className="task-detail__detail-modal-field-value-item task-detail__detail-modal-field-item--attachment">
                    <a
                      href={file.fileUrl}
                      download={file.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="task-detail__detail-modal-field-value-item-attachment-link truncate"
                    >
                      {icon}
                      <div className="truncate task-detail__detail-modal-field-value-item-attachment-name">{file.fileName}</div>
                      <div className="task-detail__detail-modal-field-value-item-attachment-download">
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#1f1f1f">
                          <path d="M160-120v-80h640v80H160Zm320-160L280-480l56-56 104 104v-408h80v408l104-104 56 56-200 200Z" />
                        </svg>
                      </div>
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
          {extractedUrl && <LinkPreview link={extractedUrl} />}
          <div className="task-detail__detail-modal-chat-reply-button" onClick={handleReplyInfo}>답글 달기</div>
          {chat.replies && chat.replies.length > 0 && (
            <div className="task-detail__detail-modal-chat-replies" onClick={handleToggleReplies}>
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
        (<div className="task-detail__detail-modal-chat-replies-container">
          {chat.replies.map(reply => (
            <ChatItem
              key={reply.chatId}
              chat={reply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              currentUserId={currentUserId}
              depth={depth + 1}
              taskId={taskId}
              handleReplyId={handleReplyId}
              onStartEdit={onStartEdit}
              onClick={onClick}
              scrollToElement={scrollToElement}
            />
          ))}
        </div>)}
    </>
  );
};

export default ChatItem;