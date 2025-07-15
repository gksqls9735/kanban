import { ChangeEvent, ClipboardEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import useUserStore from "../../store/user-store";
import { Chat, FileAttachment } from "../../types/type";
import { useKanbanActions } from "../../context/task-action-context";
import { generateUniqueId } from "../../utils/text-function";

const areFilesEqual = (fileA: FileAttachment | File, fileB: File): boolean => {
  const nameA = 'fileName' in fileA ? fileA.fileName : fileA.name;
  const typeA = 'fileType' in fileA ? fileA.fileType : fileA.type;
  return nameA === fileB.name && fileA.size === fileB.size && typeA === fileB.type;
};

interface UseChatInputProps {
  taskId: string;
  parentChat?: { parentId: string; username: string } | null;
  editingChat?: { chatId: string; content: string; parentChatId: string | null; attachments?: FileAttachment[] } | null;
  onFinishEdit?: () => void;
  onClose?: () => void;
  onChatSent?: (sentChatId: string, parentChatId: string | null, isNewCommentAdded: boolean) => void;
  addChat: (newChat: Chat) => void;
  updateChat: (targetChatId: string, patch: Partial<Chat>) => void;
}

export const useChatInput = ({
  taskId,
  parentChat,
  editingChat,
  onFinishEdit,
  onClose,
  onChatSent,
  addChat,
  updateChat,
}: UseChatInputProps) => {
  const currentUser = useUserStore(state => state.currentUser)!;
  const textInputRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { onFileStateChange } = useKanbanActions();

  // --- 1. 요청하신 분리된 상태 변수 ---
  const [existingAttachments, setExistingAttachments] = useState<FileAttachment[]>([]);
  const [newlyAddedFiles, setNewlyAddedFiles] = useState<File[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([]);

  // --- 2. 화면 표시용 데이터 생성 ---
  const attachmentsForDisplay = useMemo<FileAttachment[]>(() => {
    const newFilesAsAttachments = newlyAddedFiles.map(file => ({
      fileId: `temp-${file.name}-${file.lastModified}`,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileType: file.type,
      size: file.size // areFilesEqual을 위해 size 추가
    }));
    return [...existingAttachments, ...newFilesAsAttachments];
  }, [existingAttachments, newlyAddedFiles]);

  // --- 3. 메모리 관리 ---
  useEffect(() => {
    return () => {
      attachmentsForDisplay.forEach(att => {
        if (att.fileId.startsWith('temp-')) {
          URL.revokeObjectURL(att.fileUrl);
        }
      });
    };
  }, [attachmentsForDisplay]);

  // --- 4. 수정 모드 진입/종료 로직 ---
  useEffect(() => {
    const divElement = textInputRef.current;
    if (!divElement) return;

    if (editingChat) {
      divElement.innerHTML = editingChat.content;
      setExistingAttachments(editingChat.attachments || []);
      setNewlyAddedFiles([]);
      setDeletedAttachmentIds([]);
    } else {
      divElement.innerHTML = "";
      setExistingAttachments([]);
      setNewlyAddedFiles([]);
      setDeletedAttachmentIds([]);
    }
    checkAndSetPlaceholder(divElement);
    adjustInputHeight(divElement);
  }, [editingChat]);

  const checkAndSetPlaceholder = (element: HTMLDivElement | null) => {
    if (!element) return;

    const hasText = element.textContent?.trim() !== '';

    if (hasText || attachmentsForDisplay.length > 0) {
      element.classList.remove('show-placeholder');
    } else {
      element.classList.add('show-placeholder');
    }
  };


  useEffect(() => {
    if (parentChat) textInputRef.current?.focus();
  }, [parentChat]);

  const handleIconClick = () => fileInputRef.current?.click();

  // --- 5. 파일 핸들러 구현 ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setNewlyAddedFiles(prev => {
        const uniqueNewFiles = newFiles.filter(newFile =>
          !attachmentsForDisplay.some(existingFile => areFilesEqual(existingFile, newFile))
        );
        return [...prev, ...uniqueNewFiles];
      });
      e.target.value = '';
    }
  };

  const handleDeleteFile = (fileToDelete: FileAttachment) => {
    if (fileToDelete.fileId.startsWith('temp-')) {
      setNewlyAddedFiles(prev =>
        prev.filter(f => `temp-${f.name}-${f.lastModified}` !== fileToDelete.fileId)
      );
    } else {
      setDeletedAttachmentIds(prev => [...prev, fileToDelete.fileId]);
      setExistingAttachments(prev => prev.filter(att => att.fileId !== fileToDelete.fileId));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => e.currentTarget.classList.remove('show-placeholder');
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => checkAndSetPlaceholder(e.currentTarget);

  const handleDivInput = (event: React.FormEvent<HTMLDivElement>) => {
    const divElement = event.currentTarget;

    // 📌 내용이 비었을 때 브라우저가 남기는 <br> 태그를 강제로 제거
    if (divElement.innerHTML === '<br>') {
      divElement.innerHTML = '';
    }

    // 그 다음에 높이 조절과 플레이스홀더 체크를 수행
    adjustInputHeight(divElement);
    checkAndSetPlaceholder(divElement);
  };

  const adjustInputHeight = (element: HTMLDivElement | null) => {
    if (!element) return;
    setTimeout(() => {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }, 0);
  }

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const imgFile = Array.from(e.clipboardData.items)
      .find(item => item.type.indexOf('image') !== -1)
      ?.getAsFile();

    if (imgFile) {
      const newFile = new File([imgFile], `image.${imgFile.type.split('/')[1]}`, { type: imgFile.type });
      if (!attachmentsForDisplay.some(existingFile => areFilesEqual(existingFile, newFile))) setNewlyAddedFiles(prev => [...prev, newFile]);
    } else {
      const text = e.clipboardData.getData('text/plain');

      if (text) {
        document.execCommand('insertText', false, text);

        setTimeout(() => {
          adjustInputHeight(textInputRef.current);
          checkAndSetPlaceholder(textInputRef.current);
        }, 0);
      }
    }
  };

  const handleSubmit = async (
    e: KeyboardEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (isSubmitting) return; // 이미 제출 중이면 반환

    const isKeyboardEvent = e.type === 'keydown';
    const keyboardEvent = isKeyboardEvent ? (e as KeyboardEvent<HTMLDivElement>) : null;

    // 한글 조합 중 또는 shifh + enter
    if (keyboardEvent?.nativeEvent.isComposing || (keyboardEvent?.key === 'Enter' && keyboardEvent?.shiftKey)) return;

    // 제출을 트리거하는 조겅 (enter 또는 클릭)
    const shouldSubmit = (keyboardEvent?.key === 'Enter') || e.type === 'click';
    // 제출 조건이 아니라면 즉시 반환
    if (!shouldSubmit) return;

    // 제출이 맞다면 기본 이벤트 방지
    e.preventDefault();
    // 제출 로직
    setIsSubmitting(true);

    const chatContent = textInputRef.current?.innerHTML ?? "";
    const hasText = textInputRef.current?.textContent?.trim();

    // 유효성 검사 (내용과 첨부파일이 모두 없을 때 제출 방지)
    if (!hasText && attachmentsForDisplay.length === 0) {
      setIsSubmitting(false);
      textInputRef.current?.focus();
      return;
    }

    let sentChatId: string;
    let sentParentChatId: string | null = null;
    let isNewCommentOrReply: boolean = false;


    // 추가파일, 삭제 파일 전달 로직 추가예정
    if (editingChat) {
      await updateChat(editingChat.chatId, { chatContent });
      sentChatId = editingChat.chatId;
      sentParentChatId = editingChat.parentChatId;
      if (onFileStateChange && (newlyAddedFiles.length > 0 || deletedAttachmentIds.length > 0)) {
        onFileStateChange(editingChat.chatId, 'chat', newlyAddedFiles, deletedAttachmentIds);
      }
      if (onFinishEdit) onFinishEdit(); // 수정 모드 종료
    } else {
      // 새 댓글 또는 답글 모드
      if (!currentUser) return;
      isNewCommentOrReply = true;
      const newChat: Chat = {
        chatId: generateUniqueId('chat'), // 고유 ID 생성
        taskId: taskId,
        parentChatId: parentChat?.parentId ?? null, // 답글인 경우 부모 ID 설정
        chatContent: chatContent,
        user: currentUser,
        createdAt: new Date(), // ISO 문자열 형식으로 저장 (일관성을 위해)
        likedUserIds: [],
        attachments: [], // 첨부 파일 추가
      };
      await addChat(newChat);
      sentChatId = newChat.chatId;
      sentParentChatId = newChat.parentChatId;
      if (onFileStateChange && newlyAddedFiles.length > 0) onFileStateChange(newChat.chatId, 'chat', newlyAddedFiles, []);
      if (parentChat?.parentId && onClose) onClose(); // 답글 입력창 닫기 (답글 모드일 경우)
    }

    // 입력 필드 초기화
    if (textInputRef.current) {
      textInputRef.current.innerHTML = "";
      textInputRef.current.style.height = 'auto'; // 높이 초기화
      checkAndSetPlaceholder(textInputRef.current);
    }
    setExistingAttachments([]);
    setNewlyAddedFiles([]);
    setDeletedAttachmentIds([]);
    setIsSubmitting(false);

    // 채팅 전송 또는 편집 완료 후, 부모 컴포넌트 (DetailModal)에 스크롤 요청
    if (onChatSent) onChatSent(sentChatId, sentParentChatId, isNewCommentOrReply);
  };

  return {
    currentUser,
    textInputRef,
    fileInputRef,
    attachmentsForDisplay,
    isSubmitting,
    handleIconClick,
    handleFileChange,
    handleDeleteFile,
    handleDivInput,
    handleFocus,
    handleBlur,
    handlePaste,
    handleSubmit,
  };

};
