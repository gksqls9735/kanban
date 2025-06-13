// ChatInput.tsx

import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { generateUniqueId, getInitial } from "../../../../utils/text-function";
import { Chat, FileAttachment, Participant, User } from "../../../../types/type";
import { ChangeEvent, useRef, useState, KeyboardEvent, useEffect } from "react"; // KeyboardEvent 임포트
import useChatStore from "../../../../store/chat-store";
import useUserStore from "../../../../store/user-store";
import { getFileTypeInfo } from "../../common/file-icon";
import AvatarItem from "../../../common/avatar/avatar";

// 임시 파일 업로드 함수 (실제로는 서버 API 호출)
const uploadFileToServer = async (file: File): Promise<FileAttachment> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    fileId: generateUniqueId('file'),
    fileName: file.name,
    fileUrl: URL.createObjectURL(file),
    fileType: file.type,
  };
};

const ChatInput: React.FC<{
  taskId: string;
  parentChat?: { parentId: string, username: string } | null;
  onClose?: () => void;
  editingChat?: { chatId: string, content: string, parentChatId: string | null } | null;
  onFinishEdit?: () => void;
  onClick: (e: React.MouseEvent, user: Participant | User | null) => void;
}> = ({ taskId, parentChat, onClose, editingChat, onFinishEdit, onClick }) => {
  const addChatToTask = useChatStore(state => state.addChatToTask);
  const updateChat = useChatStore(state => state.updateChat);
  const currentUser = useUserStore(state => state.currentUser)!;

  const textInputRef = useRef<HTMLTextAreaElement>(null); // HTMLTextAreaElement로 변경
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState<File[]>([]);

  // 중복 제출 방지
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 수정보드일때 textarea 초기값 설정
  useEffect(() => {
    if (editingChat && textInputRef.current) {
      textInputRef.current.value = editingChat.content;
      handleTextAreaInput({ currentTarget: textInputRef.current } as React.FormEvent<HTMLTextAreaElement>);
      textInputRef.current.focus();
    } else if (!editingChat && textInputRef.current) {
      textInputRef.current.value = "";
    }
  }, [editingChat]);

  useEffect(() => {
    if (parentChat && textInputRef.current) textInputRef.current.focus();
  }, [parentChat]);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFilesForUpload(prev => [...prev, ...Array.from(event.target.files!)]);
      event.target.value = '';
    }
  };


  const handleSubmit = async (
    e: KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (isSubmitting) return; // 이미 제출 중이면 반환

    const processSubmit = async () => {
      setIsSubmitting(true);
      const chatContent = textInputRef.current?.value ?? "";

      // 수정 모드가 아니고, 내용과 파일 모두 없을 때 (새 댓글)
      if (!editingChat && !chatContent && selectedFilesForUpload.length === 0) {
        setIsSubmitting(false);
        return;
      }
      // 수정 모드이고, 내용과 파일 모두 없을 때 (기존 내용 다 지우고 파일도 없을 때)
      // 이 경우는 허용할 수도, 막을 수도 있음 (정책에 따라)
      // 여기서는 일단 내용이 있어야 수정 가능하다고 가정 (파일은 선택사항)
      if (editingChat && !chatContent && selectedFilesForUpload.length === 0) {
        setIsSubmitting(false);
        if (textInputRef.current) textInputRef.current.focus();
        return;
      }


      let uploadedAttachments: FileAttachment[] = [];
      if (selectedFilesForUpload.length > 0) {
        // 파일 업로드는 수정 시에도 새로 추가되는 파일에 대해서만 처리
        // 기존 첨부파일을 유지/삭제하는 로직은 더 복잡해지므로 여기서는 새 파일 추가만 고려
        for (const file of selectedFilesForUpload) {
          try {
            const attachment = await uploadFileToServer(file);
            uploadedAttachments.push(attachment);
          } catch (error) {
            console.error("File upload failed:", error);
          }
        }
      }

      if (editingChat) {
        // 수정 모드
        const updatePayload: Partial<Chat> = { chatContent };
        if (uploadedAttachments.length > 0) {
          // 기존 첨부파일에 새 첨부파일을 추가하는 방식 (정책에 따라 다를 수 있음)
          // Chat 타입에 attachments가 FileAttachment[] | undefined 등으로 되어있어야 함
          // updatePayload.attachments = [...(chatToEdit.attachments || []), ...uploadedAttachments];
          // 여기서는 간단하게 새로 업로드된 파일만 반영 (기존 파일은 유지된다고 가정, 스토어 로직에서 처리)
          updatePayload.attachments = uploadedAttachments; // 또는 기존것과 합치는 로직
        }
        updateChat(taskId, editingChat.chatId, updatePayload);
        if (onFinishEdit) {
          onFinishEdit();
        }
      } else {
        // 새 댓글 모드
        const newChat: Chat = {
          chatId: generateUniqueId('chat'),
          taskId: taskId,
          parentChatId: parentChat?.parentId ?? null,
          chatContent: chatContent,
          user: currentUser,
          createdAt: new Date(),
          likedUserIds: [],
          attachments: uploadedAttachments,
          replies: [],
        };
        addChatToTask(taskId, newChat);
        if (parentChat?.parentId && onClose) {
          onClose(); // 답글 입력창 닫기
        }
      }

      // 입력 필드 초기화
      if (textInputRef.current) {
        textInputRef.current.value = "";
        textInputRef.current.style.height = 'auto';
      }
      setSelectedFilesForUpload([]);
      setIsSubmitting(false);
    };


    if (e.type === 'keydown') {
      const keyboardEvent = e as KeyboardEvent<HTMLTextAreaElement>;
      if (keyboardEvent.nativeEvent.isComposing) {
        setIsSubmitting(false);
        return;
      }
      if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
        e.preventDefault();
        await processSubmit();
      } else if (keyboardEvent.key === 'Enter' && keyboardEvent.shiftKey) {
        setIsSubmitting(false);
        return;
      } else if (keyboardEvent.key !== 'Enter') {
        setIsSubmitting(false);
        return;
      }
    } else if (e.type === 'click') {
      e.preventDefault();
      await processSubmit();
    }
  };


  const handleDeleteFile = (name: string) => { // 함수 이름 변경
    setSelectedFilesForUpload(prev => prev.filter(file => file.name !== name));
  }

  const handleTextAreaInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

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
          <textarea // input에서 textarea로 변경
            ref={textInputRef}
            placeholder="댓글을 입력하세요... (줄바꿈 Shift + Enter / 입력 Enter 입니다)"
            onKeyDown={handleSubmit} // Enter 키 및 Shift+Enter 처리
            onInput={handleTextAreaInput} // 내용 입력 시 높이 자동 조절 (선택 사항)
            rows={1} // 초기 줄 수 (CSS로 min-height 설정하는 것이 더 좋을 수 있음)
            style={{ overflowY: 'hidden' }} // 내용이 적을 때 스크롤바 숨김 (선택 사항)
          />
          {editingChat && (<div className="task-detail__detail-modal-chat-input--content-cancel" onClick={onFinishEdit}>취소</div>)}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleFileChange}
          />
          {/* 아이콘 위치 조정을 위해 wrapper div를 사용하거나 flex-end 등으로 정렬 필요할 수 있음 */}
          <FontAwesomeIcon icon={faPaperclip} className="task-detail__detail-modal-chat-input-attach-icon" onClick={handleIconClick} />
          {/* <button onClick={handleSubmit}>전송</button> */}
        </div>
      </div>
      {selectedFilesForUpload.length > 0 && (
        <ul className="task-detail__detail-modal-field-content-list">
          {selectedFilesForUpload.map(file => {
            const { icon } = getFileTypeInfo(file.name);
            return (
              <li key={`${file.name}-${file.size}-${file.lastModified}`} className="task-detail__detail-modal-field-value-item task-detail__detail-modal-field-item--attachment">
                <div className="task-detail__detail-modal-field-value-item-attachment-link truncate">
                  {icon}
                  <div className="truncate task-detail__detail-modal-field-value-item-attachment-name">{file.name}</div>
                  <div className="task-detail__detail-modal-field-value-item-attachment-download" onClick={() => handleDeleteFile(file.name)} style={{ cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="#8D99A8" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x" id="X--Streamline-Feather" height="16" width="16">
                      <desc>X Streamline Icon: https://streamlinehq.com</desc>
                      <path d="M11.25 3.75 3.75 11.25" strokeWidth="1"></path>
                      <path d="m3.75 3.75 7.5 7.5" strokeWidth="1"></path>
                    </svg>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ChatInput;