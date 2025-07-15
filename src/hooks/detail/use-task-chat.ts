import { useCallback, useState } from "react";
import useChatStore from "../../store/chat-store";
import { Chat, FileAttachment } from "../../types/type";

export const useTaskChat = (taskId: string, chatScrollContainerRef: React.RefObject<HTMLDivElement | null>) => {
  const [reply, setReply] = useState<{ parentId: string; username: string } | null>(null);
  const [editingChatInfo, setEditingChatInfo] = useState<{
    chatId: string; content: string; parentChatId: string | null; taskId: string; attachments?: FileAttachment[]
  } | null>(null);

  const addChat = useChatStore(state => state.addChat);
  const updateChat = useChatStore(state => state.updateChat);
  const deleteChat = useChatStore(state => state.deleteChat);

  const handleCancelReply = () => setReply(null);

  const handleReplyId = (parentId: string, username: string) => {
    setReply({ parentId, username });
    if (editingChatInfo) setEditingChatInfo(null);
  };

  const handleStartEditComment = (chatToEdit: Chat) => {
    setEditingChatInfo({
      chatId: chatToEdit.chatId,
      content: chatToEdit.chatContent,
      parentChatId: chatToEdit.parentChatId,
      taskId: chatToEdit.taskId,
      attachments: chatToEdit.attachments
    });
    if (reply) setReply(null);
  };

  const handleChatEditFinish = () => setEditingChatInfo(null);

  const scrollToElement = useCallback((elementOrChatId: HTMLElement | null | string) => {
    let targetElement: HTMLElement | null = null;
    if (typeof elementOrChatId === 'string') {
      targetElement = document.querySelector(`[data-chat-id="${elementOrChatId}"]`);
    } else {
      targetElement = elementOrChatId;
    }

    if (targetElement && chatScrollContainerRef.current) {
      requestAnimationFrame(() => {
        targetElement!.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    } else {
      console.warn("scrollToElement: Target element or scroll container not found for ID/element:", elementOrChatId, chatScrollContainerRef.current);
    }
  }, [chatScrollContainerRef]);

  const scrollToBottom = useCallback(() => {
    if (chatScrollContainerRef.current) {
      requestAnimationFrame(() => {
        chatScrollContainerRef.current!.scrollTop = chatScrollContainerRef.current!.scrollHeight;
      });
    }
  }, [chatScrollContainerRef]);

  const handleChatSent = useCallback((sentChatId: string, parentChatId: string | null, isNewCommentAdded: boolean) => {
    requestAnimationFrame(() => {
      if (isNewCommentAdded) parentChatId === null ? scrollToBottom() : scrollToElement(parentChatId);
    });
  }, [scrollToBottom, scrollToElement]);

  return {
    reply, editingChatInfo,
    addChat, updateChat, deleteChat,
    handleCancelReply, handleReplyId, handleStartEditComment, handleChatEditFinish, handleChatSent,
    scrollToElement,
  }

};