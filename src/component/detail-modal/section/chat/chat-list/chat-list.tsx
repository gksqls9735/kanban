import useChatStore from "../../../../../store/chat-store";
import { Chat, User } from "../../../../../types/type"
import ChatItem from "./chat-item";

const ChatList: React.FC<{
  currentUser: User;
  taskId: string;
}> = ({ currentUser, taskId }) => {
  const isLikedByCurrentUser = (chatLikeList: string[]) => chatLikeList.includes(currentUser.id);

  const chats = useChatStore(s => s.chatsByTask[taskId] || []);
  const updateChat = useChatStore(s => s.updateChat);

  const handleUpdateChat = (chatId: string, update: Partial<Chat>, parentId: string | null) => {
    updateChat(taskId, parentId, chatId, update);
  };

  return (
    <div className="task-detail__detail-modal-section">
      <div className="task-detail__detail-modal-chat-list">
        {chats.map(chat => (
          <ChatItem
            key={chat.chatId}
            chat={chat}
            isLikedByCurrentUser={isLikedByCurrentUser(chat.likedUserIds || [])}
            onUpdate={handleUpdateChat}
            currentUserId={currentUser.id}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatList;