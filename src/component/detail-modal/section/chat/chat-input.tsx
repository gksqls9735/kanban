// ChatInput.tsx

import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AvatarItem from "../../../avatar/avatar";
import { generateUniqueId, getInitial } from "../../../../utils/text-function";
import { Chat, FileAttachment } from "../../../../types/type";
import { ChangeEvent, useRef, useState, KeyboardEvent } from "react"; // KeyboardEvent 임포트
import useChatStore from "../../../../store/chat-store";
import useUserStore from "../../../../store/user-store";
import { getFileTypeInfo } from "../../common/file-icon";

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
  taskId: string; parentChat?: { parentId: string, username: string } | null; onClose?: () => void;
}> = ({ taskId, parentChat, onClose }) => {
  const addChatToTask = useChatStore(state => state.addChatToTask);
  const currentUser = useUserStore(state => state.currentUser)!;

  const textInputRef = useRef<HTMLTextAreaElement>(null); // HTMLTextAreaElement로 변경
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState<File[]>([]);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFilesForUpload(prevFiles => [...prevFiles, ...Array.from(event.target.files!)]);
      event.target.value = '';
    }
  };

  const handleSubmit = async (
    // KeyboardEvent의 타입을 HTMLTextAreaElement로 명시
    e: KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e.type === 'keydown') {
      const keyboardEvent = e as KeyboardEvent<HTMLTextAreaElement>;
      if (keyboardEvent.nativeEvent.isComposing) {
        return;
      }

      // Enter만 눌렀을 때 (Shift + Enter가 아닐 때) 제출
      if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
        e.preventDefault(); // Enter 키의 기본 동작(줄바꿈)을 막고 제출 처리
        // 제출 로직 진행
      } else if (keyboardEvent.key === 'Enter' && keyboardEvent.shiftKey) {
        // Shift + Enter는 기본 동작(줄바꿈)을 허용하므로 아무것도 하지 않음
        return;
      } else if (keyboardEvent.key !== 'Enter') {
        // Enter 키가 아닌 다른 키 입력은 무시
        return;
      }
    } else if (e.type === 'click') {
      // 클릭 이벤트의 경우 항상 제출 (버튼 클릭 시)
      e.preventDefault();
    }


    const chatContent = textInputRef.current?.value.trim() || "";

    if (!chatContent && selectedFilesForUpload.length === 0) {
      console.log("Chat content and files are empty");
      return;
    }

    let uploadedAttachments: FileAttachment[] = [];
    if (selectedFilesForUpload.length > 0) {
      for (const file of selectedFilesForUpload) {
        try {
          const attachment = await uploadFileToServer(file);
          uploadedAttachments.push(attachment);
        } catch (error) {
          console.error("File upload failed:", error);
        }
      }
    }

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
    }
    addChatToTask(taskId, newChat);
    if (parentChat?.parentId && onClose) {
      onClose();
    }
    if (textInputRef.current) {
      textInputRef.current.value = "";
      // 필요하다면 textarea 높이 초기화 로직 추가
      textInputRef.current.style.height = 'auto'; // 예시: 높이 초기화
    }
    setSelectedFilesForUpload([]);
  };

  const handleDelete = (name: string) => {
    setSelectedFilesForUpload(prev => prev.filter(file => file.name !== name));
  }

  // textarea 높이 자동 조절 (선택 사항)
  const handleTextAreaInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    textarea.style.height = 'auto'; // 높이를 auto로 설정하여 scrollHeight를 정확히 계산
    textarea.style.height = `${textarea.scrollHeight}px`; // scrollHeight만큼 높이 설정
  };

  return (
    <div className="task-detail__detail-modal-chat-input-area">
      {parentChat && (
        <div className="task-detail__detail-modal-chat-input-area--reply">
          <span>{parentChat.username}님에게 답글 달기</span>
          <span onClick={onClose}>취소</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' /* 아이콘과 textarea 정렬 */ }}>
        <AvatarItem fontSize={22} isOverflow={true} size={40} isFirst={false}>{getInitial(currentUser.username)}</AvatarItem>
        <div className="task-detail__detail-modal-chat-input-wrapper">
          <textarea // input에서 textarea로 변경
            ref={textInputRef}
            placeholder="댓글을 입력하세요... (줄바꿈 Shift + Enter / 입력 Enter 입니다)"
            onKeyDown={handleSubmit} // Enter 키 및 Shift+Enter 처리
            onInput={handleTextAreaInput} // 내용 입력 시 높이 자동 조절 (선택 사항)
            rows={1} // 초기 줄 수 (CSS로 min-height 설정하는 것이 더 좋을 수 있음)
            style={{ overflowY: 'hidden' }} // 내용이 적을 때 스크롤바 숨김 (선택 사항)
          />
          <input
            type="file"
            ref={fileInputRef}
            multiple
            style={{ display: 'none' }}
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
                  <div className="task-detail__detail-modal-field-value-item-attachment-download" onClick={() => handleDelete(file.name)} style={{ cursor: 'pointer' }}>
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