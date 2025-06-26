import { useMemo } from "react";
import useChatStore, { buildChatTreeRecursive } from "../../../../../store/chat-store";
import { Chat, Participant, User } from "../../../../../types/type";
import ChatItem from "./chat-item";

const ChatList: React.FC<{
  currentUser: User;
  taskId: string;
  handleReplyId: (parentId: string, username: string) => void;
  onStartEditComment: (chatToEdit: Chat) => void;
  onClick: (e: React.MouseEvent, user: Participant | User | null) => void;
  scrollToElement: (element: HTMLElement | null | string) => void;
  onUpdate: (chatId: string, update: Partial<Chat>) => void;
  onDelete: (chatId: string) => void;
}> = ({ currentUser, taskId, handleReplyId, onStartEditComment, onClick, scrollToElement, onUpdate, onDelete }) => {
  const isLikedByCurrentUser = (chatLikeList: string[]) => chatLikeList.includes(currentUser.id);

  const allChats = useChatStore(state => state.allChats);

  const chats = useMemo(() => {
    const taskChats = allChats.filter(chat => chat.taskId === taskId);
    return buildChatTreeRecursive(taskChats, null);
  }, [allChats, taskId]);

  const handleUpdateChat = onUpdate;
  const handleDeleteChat = onDelete;

  return (
    <>
      {chats.length > 0 && (
        <div className="task-detail__detail-modal-section">
          <div className="task-detail__detail-modal-chat-list">
            {chats.length > 0 && chats.map(chat => (
              <ChatItem
                key={chat.chatId}
                chat={chat}
                isLikedByCurrentUser={isLikedByCurrentUser(chat.likedUserIds || [])}
                onUpdate={handleUpdateChat}
                onDelete={handleDeleteChat}
                currentUserId={currentUser.id}
                depth={0}
                taskId={taskId}
                handleReplyId={handleReplyId}
                onStartEdit={onStartEditComment}
                onClick={onClick}
                scrollToElement={scrollToElement}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatList;