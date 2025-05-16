import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AvatarItem from "../../../avatar/avatar";
import { getInitial } from "../../../../utils/text-function";
import { User } from "../../../../types/type";
import { useRef } from "react";

const ChatInput: React.FC<{
  currentUser: User;
  taskId: string;
}> = ({ currentUser, taskId }) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="task-detail__detail-modal-chat-input-area">
      <AvatarItem fontSize={22} isOverflow={true} size={40} isFirst={false}>{getInitial(currentUser.username)}</AvatarItem>
      <div className="task-detail__detail-modal-chat-input-wrapper">
        <input
          type="text"
          placeholder="댓글을 입력하세요... (줄바꿈 Shift + Enter / 입력 Enter 입니다)"
        />
        <input
          type="file"
          ref={fileInputRef}
          multiple
        />
        <FontAwesomeIcon icon={faPaperclip} className="task-detail__detail-modal-chat-input-attach-icon" onClick={handleIconClick}/>
      </div>
    </div>
  );
};

export default ChatInput;