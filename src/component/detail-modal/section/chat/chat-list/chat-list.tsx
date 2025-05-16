import { Chat, User } from "../../../../../types/type"
import ChatItem from "./chat-item";

const ChatList: React.FC<{
  chatlist: Chat[];
  currentUser: User;
  taskId: string;
}> = ({ chatlist, currentUser, taskId }) => {
  const isLikedByCurrentUser = (chatLikeList: string[]) => chatLikeList.includes(currentUser.id)

  return (
    <div className="task-detail__detail-modal-section">
      <div className="task-detail__detail-modal-chat-list">
        {chatlist.map(chat => (
          <ChatItem chat={chat} isLikedByCurrentUser={isLikedByCurrentUser(chat.likedUserIds)} />
        ))}
      </div>
    </div>
  );
};

export default ChatList;