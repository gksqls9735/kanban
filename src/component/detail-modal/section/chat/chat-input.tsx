import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { getFileTypeInfo } from "../../common/file-icon";
import { Chat, FileAttachment, Participant, User } from "../../../../types/type";
import { generateUniqueId, getInitial } from "../../../../utils/text-function";
import useChatStore from "../../../../store/chat-store";
import useUserStore from "../../../../store/user-store";
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
  onChatSent?: () => void;
}> = ({ taskId, parentChat, onClose, editingChat, onFinishEdit, onClick, onChatSent }) => {
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
      handleTextAreaInput({ currentTarget: textInputRef.current } as React.FormEvent<HTMLTextAreaElement>);
    }
  }, [editingChat]);

  // 답글 모드일 때 textarea 포커스
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

    const isKeyboardEvent = e.type === 'keydown';
    const keyboardEvent = isKeyboardEvent ? (e as KeyboardEvent<HTMLTextAreaElement>) : null;

    // 1. 한글 조합 중이거나, Shift + Enter (줄바꿈)일 경우 즉시 반환
    if (isKeyboardEvent) {
      // 조합 중일 때는 어떤 키 입력도 무시
      if (keyboardEvent?.nativeEvent.isComposing) return;
      // Shift + Enter는 줄바꿈, 제출 아님
      if (keyboardEvent?.key === 'Enter' && keyboardEvent?.shiftKey) return;
    }

    // 2. 제출을 트리거하는 조건 (Enter 키 또는 클릭 이벤트)
    const shouldSubmit =
      (isKeyboardEvent && keyboardEvent?.key === 'Enter') ||
      e.type === 'click';

    // 제출 조건이 아니라면 즉시 반환 (스페이스바 등)
    if (!shouldSubmit) return;

    // 3. 제출이 맞다면 기본 이벤트 방지
    if (shouldSubmit && isKeyboardEvent && keyboardEvent?.key === 'Enter') {
      e.preventDefault(); // Enter 키로 인한 기본 폼 제출 방지
    } else if (shouldSubmit && e.type === 'click') {
      e.preventDefault();
    }

    // 이 아래부터는 제출 로직 시작
    setIsSubmitting(true);

    const chatContent = textInputRef.current?.value ?? "";

    // 유효성 검사 (내용과 첨부파일이 모두 없을 때 제출 방지)
    if (!chatContent.trim() && selectedFilesForUpload.length === 0) {
      setIsSubmitting(false); // 제출 상태 해제
      if (textInputRef.current) textInputRef.current.focus();
      return;
    }

    let uploadedAttachments: FileAttachment[] = [];
    if (selectedFilesForUpload.length > 0) {
      for (const file of selectedFilesForUpload) {
        try {
          const attachment = await uploadFileToServer(file);
          uploadedAttachments.push(attachment);
        } catch (error) {
          console.error("File upload failed: ", error);
          // 파일 업로드 실패 시 사용자에게 알리거나, 해당 파일만 제외하고 진행할지 결정
        }
      }
    }

    if (editingChat) {
      // 수정 모드
      const updatePayload: Partial<Chat> = { chatContent };
      if (uploadedAttachments.length > 0) {
        updatePayload.attachments = uploadedAttachments;
      }
      updateChat(taskId, editingChat.chatId, updatePayload);
      if (onFinishEdit) {
        onFinishEdit(); // 수정 모드 종료
      }
    } else {
      // 새 댓글 또는 답글 모드
      const newChat: Chat = {
        chatId: generateUniqueId('chat'), // 고유 ID 생성
        taskId: taskId,
        parentChatId: parentChat?.parentId ?? null, // 답글인 경우 부모 ID 설정
        chatContent: chatContent,
        user: currentUser,
        createdAt: new Date(), // ISO 문자열 형식으로 저장 (일관성을 위해)
        likedUserIds: [],
        attachments: uploadedAttachments, // 첨부 파일 추가
        replies: [], // 초기 답글 배열은 비워둠
      };
      addChatToTask(taskId, newChat); // Store에 새 채팅/답글 추가
      if (parentChat?.parentId && onClose) {
        onClose(); // 답글 입력창 닫기 (답글 모드일 경우)
      }
    }

    // 입력 필드 초기화
    if (textInputRef.current) {
      textInputRef.current.value = "";
      textInputRef.current.style.height = 'auto'; // 높이 초기화
    }
    setSelectedFilesForUpload([]); // 선택된 파일 초기화
    setIsSubmitting(false); // 제출 상태 해제

    // 채팅 전송 또는 편집 완료 후, 부모 컴포넌트 (DetailModal)에 스크롤 요청
    if (onChatSent) {
      onChatSent();
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
          <textarea
            ref={textInputRef}
            placeholder="댓글을 입력하세요... (줄바꿈 Shift + Enter / 입력 Enter 입니다)"
            onKeyDown={handleSubmit}
            onInput={handleTextAreaInput}
            rows={1}
            style={{ overflowY: 'hidden' }}
          />
          {editingChat && (<div className="task-detail__detail-modal-chat-input--content-cancel" onClick={onFinishEdit}>취소</div>)}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleFileChange}
          />
          <FontAwesomeIcon icon={faPaperclip} className="task-detail__detail-modal-chat-input-attach-icon" onClick={handleIconClick} />
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