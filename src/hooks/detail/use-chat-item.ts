import { useMemo, useState } from "react";
import { Chat, FileAttachment } from "../../types/type";
import { extractUrl } from "../../utils/text-function";

const isImgAttachment = (attachment: FileAttachment): boolean => {
  return attachment.fileType.startsWith('image/');
};

interface UseChatItemProps {
  chat: Chat;
  currentUserId: string;
  onUpdate: (chatId: string, update: Partial<Chat>) => void;
  onDelete: (chatId: string) => void;
  onStartEdit: (chatToEdit: Chat) => void;
  handleReplyId: (parentId: string, username: string) => void;
}

export const useChatItem = ({
  chat,
  currentUserId,
  onUpdate,
  onDelete,
  onStartEdit,
  handleReplyId,
}: UseChatItemProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { imgAttachments, otherAttachments } = useMemo(() => {
    const attachments = chat.attachments || [];
    return {
      imgAttachments: attachments.filter(isImgAttachment),
      otherAttachments: attachments.filter(att => !isImgAttachment(att)),
    };
  }, [chat.attachments]);

  // 현재 유저의 좋아요 여부
  const isLikedByCurrentUser = useMemo(
    () => (chat.likedUserIds || []).includes(currentUserId),
    [chat.likedUserIds, currentUserId]
  );

  // 좋아요 토글 핸들러
  const handleLikeToggle = () => {
    const newLikedUserIds = isLikedByCurrentUser
      ? (chat.likedUserIds || []).filter(id => id !== currentUserId)
      : [...(chat.likedUserIds || []), currentUserId];
    onUpdate(chat.chatId, { likedUserIds: newLikedUserIds });
  };

  // 내 댓글인지 여부
  const isMyComment = useMemo(() => currentUserId === chat.user.id, [currentUserId, chat.user.id]);

  // 수정/삭제 핸들러
  const handleEditClick = () => onStartEdit(chat);
  const handleDeleteComment = () => onDelete(chat.chatId);

  // 본문에서 URL 추출
  const extractedUrl = useMemo(() => extractUrl(chat.chatContent), [chat.chatContent]);

  // 답글 달기 버튼 핸들러
  const handleReplyInfo = () => {
    handleReplyId(chat.chatId, chat.user.username);
    if (!isExpanded) setIsExpanded(true); // 답글창을 열 때 답글 목록도 함께 펼침
  };

  // 답글 목록 토글 핸들러
  const handleToggleReplies = () => {
    setIsExpanded(prev => !prev);
  };

  return {
    isExpanded,
    isLikedByCurrentUser,
    isMyComment,
    extractedUrl,
    imgAttachments,
    otherAttachments,
    handleLikeToggle,
    handleEditClick,
    handleDeleteComment,
    handleReplyInfo,
    handleToggleReplies,
  };
};