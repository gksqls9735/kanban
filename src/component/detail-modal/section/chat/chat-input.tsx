import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AvatarItem from "../../../avatar/avatar";
import { generateUniqueId, getInitial } from "../../../../utils/text-function";
import { Chat, User } from "../../../../types/type";
import { useRef } from "react";
import useChatStore from "../../../../store/chat-store";

const ChatInput: React.FC<{
  currentUser: User;
  taskId: string;
}> = ({ currentUser, taskId }) => {
  const addChatToTask = useChatStore(state => state.addChatToTask);

  const textInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) {
      console.log("IME is composing, ignoring Enter for now");
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log("Enter pressed without Shift. Proceeding to submit.");

      const chatContent = textInputRef.current?.value.trim();
      if (!chatContent) {
        console.log("Chat content is empty");
        return;
      }

      const newChat: Chat = {
        chatId: generateUniqueId('chat'),
        taskId: taskId,
        parentChatId: null,
        chatContent: chatContent,
        user: currentUser,
        createdAt: new Date(),
        likedUserIds: [],
        attachments: [],
        replies: [],
      }
      addChatToTask(taskId, newChat);

      if (textInputRef.current) textInputRef.current.value = "";
    }
  };

  return (
    <div className="task-detail__detail-modal-chat-input-area">
      <AvatarItem fontSize={22} isOverflow={true} size={40} isFirst={false}>{getInitial(currentUser.username)}</AvatarItem>
      <div className="task-detail__detail-modal-chat-input-wrapper">
        <input
          ref={textInputRef}
          type="text"
          placeholder="댓글을 입력하세요... (줄바꿈 Shift + Enter / 입력 Enter 입니다)"
          onKeyDown={handleSubmit}
        />
        <input
          type="file"
          ref={fileInputRef}
          multiple
        />
        <FontAwesomeIcon icon={faPaperclip} className="task-detail__detail-modal-chat-input-attach-icon" onClick={handleIconClick} />
      </div>
    </div>
  );
};

export default ChatInput;