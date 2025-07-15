import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Chat, FileAttachment, Participant, User } from "../../../../types/type";
import { getInitial } from "../../../../utils/text-function";
import AvatarItem from "../../../common/avatar/avatar";
import { useChatInput } from "../../../../hooks/detail/use-chat-input";
import InputFileItem from "./input-file-item";

const ChatInput: React.FC<{
  taskId: string;
  parentChat?: { parentId: string, username: string } | null;
  onClose?: () => void;
  editingChat?: { chatId: string, content: string, parentChatId: string | null; attachments?: FileAttachment[] } | null;
  onFinishEdit?: () => void;
  onClick: (e: React.MouseEvent, user: Participant | User | null) => void;
  onChatSent?: (sentChatId: string, parentChatId: string | null, isNewCommentAdded: boolean) => void;
  addChat: (newChat: Chat) => void;
  updateChat: (targetChatId: string, patch: Partial<Chat>) => void;
}> = ({ taskId, parentChat, onClose, editingChat, onFinishEdit, onClick, onChatSent, addChat, updateChat }) => {
  const {
    currentUser,
    textInputRef,
    fileInputRef,
    attachmentsForDisplay,
    handleIconClick,
    handleFileChange,
    handleDeleteFile,
    handleDivInput,
    handleFocus,
    handleBlur,
    handlePaste,
    handleSubmit
  } = useChatInput({
    taskId, parentChat, editingChat, onFinishEdit, onClose, onChatSent, addChat, updateChat
  })

  return (
    <div className="task-detail__detail-modal-chat-input-area">
      {parentChat && (
        <div className="task-detail__detail-modal-chat-input-area--reply">
          <span>{parentChat.username}님에게 답글 달기</span>
          <span onClick={onClose}>취소</span>
        </div>
      )}
      <div className="task-detail__detail-modal-chat-input--content">
        <div onClick={e => onClick(e, currentUser)}>
          {currentUser.icon ? (
            <AvatarItem fontSize={22} size={40} isFirst={false} src={currentUser.icon}>{getInitial(currentUser.username)}</AvatarItem>
          ) : (
            <AvatarItem fontSize={22} isOverflow={true} size={40} isFirst={false}>{getInitial(currentUser.username)}</AvatarItem>
          )}
        </div>
        <div className="task-detail__detail-modal-chat-input-wrapper">
          <div className="task-detail__detail-modal-chat-input-wrapper--input">
            <div
              ref={textInputRef as React.RefObject<HTMLDivElement>}
              contentEditable="true"
              className="task-detail__detail-modal-chat-input--content-editable gantt-scrollbar-y"
              data-placeholder="댓글을 입력하세요... (줄바꿈 Shift + Enter / 입력 Enter 입니다)"
              onKeyDown={handleSubmit}
              onInput={handleDivInput}
              onPaste={handlePaste}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {editingChat && (<div className="task-detail__detail-modal-chat-input--content-cancel" style={{ marginTop: 8 }} onClick={onFinishEdit}>취소</div>)}
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileChange}
              />
              <FontAwesomeIcon icon={faPaperclip} className="task-detail__detail-modal-chat-input-attach-icon" onClick={handleIconClick} />
            </div>
          </div>
          {attachmentsForDisplay.length > 0 && (
            <ul className="task-detail__detail-modal-field-content-list" style={{ padding: '12px 20px' }}>
              {attachmentsForDisplay.map((file, idx) => (
                <InputFileItem key={`${file.fileName}-${file.size}-${idx}`} file={file} onDelete={handleDeleteFile}/>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;