// ChatList.tsx
import { useCallback, useMemo } from "react"; // useMemo 추가
import useChatStore, { buildChatTreeRecursive, ChatForUI } from "../../../../../store/chat-store"; // buildChatTreeRecursive와 ChatForUI import
import { Chat, Participant, User } from "../../../../../types/type"; // Chat 타입은 replies 제거된 상태
import ChatItem from "./chat-item";

const EMPTY_CHATS: ChatForUI[] = []; // ChatForUI 배열로 변경

const ChatList: React.FC<{
  currentUser: User;
  taskId: string;
  handleReplyId: (parentId: string, username: string) => void;
  onStartEditComment: (chatToEdit: Chat) => void; // 여기의 chatToEdit은 원본 Chat 타입으로 넘겨줍니다.
  onClick: (e: React.MouseEvent, user: Participant | User | null) => void;
  scrollToElement: (element: HTMLElement | null | string) => void; // scrollToElement prop 추가
  onUpdate: (chatId: string, update: Partial<Chat>) => void; // DetailModal로부터 전달받는 updateChat
  onDelete: (chatId: string) => void; // DetailModal로부터 전달받는 deleteChat
}> = ({ currentUser, taskId, handleReplyId, onStartEditComment, onClick, scrollToElement, onUpdate, onDelete }) => {
  const isLikedByCurrentUser = (chatLikeList: string[]) => chatLikeList.includes(currentUser.id);

  // useChatStore에서 모든 플랫한 채팅 데이터를 가져옵니다.
  const allChats = useChatStore(state => state.allChats);
  console.warn("Chatlist: ", allChats);

  // ★★★ useMemo를 사용하여 UI 렌더링을 위한 계층 구조를 생성하고 캐싱합니다.
  // allChats 또는 taskId가 변경될 때만 이 계산이 다시 수행됩니다.
  const chats = useMemo(() => {
    const taskChats = allChats.filter(chat => chat.taskId === taskId);
    return buildChatTreeRecursive(taskChats, null);
  }, [allChats, taskId]); // allChats와 taskId를 의존성 배열에 넣습니다.

  const handleUpdateChat = onUpdate;
  const handleDeleteChat = onDelete;

  return (
    <>
      {chats.length > 0 && (
        <div className="task-detail__detail-modal-section">
          <div className="task-detail__detail-modal-chat-list">
            {chats.map(chat => (
              <ChatItem
                key={chat.chatId}
                chat={chat} // ★ 이 chat 객체는 이제 ChatForUI 타입이며 replies 속성을 가집니다.
                isLikedByCurrentUser={isLikedByCurrentUser(chat.likedUserIds || [])}
                onUpdate={handleUpdateChat}
                onDelete={handleDeleteChat} // onDelete prop 추가
                currentUserId={currentUser.id}
                depth={0} // 최상위 채팅은 depth 0
                taskId={taskId} // taskId는 계속 전달 (필요할 경우를 대비)
                handleReplyId={handleReplyId}
                onStartEdit={onStartEditComment}
                onClick={onClick}
                scrollToElement={scrollToElement} // scrollToElement prop 전달
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatList;