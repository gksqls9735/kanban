import useChatStore from "../../../../../store/chat-store";
import { Chat, User } from "../../../../../types/type"
import ChatItem from "./chat-item";

const EMPTY_CHATS: Chat[] = [];

const ChatList: React.FC<{
  currentUser: User;
  taskId: string;
  handleReplyId: (parentId: string, username: string) => void;
}> = ({ currentUser, taskId, handleReplyId }) => {
  const isLikedByCurrentUser = (chatLikeList: string[]) => chatLikeList.includes(currentUser.id);

  const chats = useChatStore(s => s.chatsByTask[taskId] || EMPTY_CHATS);
  const updateChat = useChatStore(s => s.updateChat);

  const handleUpdateChat = (chatId: string, update: Partial<Chat>, parentId: string | null) => {
    updateChat(taskId, parentId, chatId, update);
  };

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
                currentUserId={currentUser.id}
                taskId={taskId}
                handleReplyId={handleReplyId}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatList;