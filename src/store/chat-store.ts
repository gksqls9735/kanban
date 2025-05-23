import { create } from "zustand";
import { Chat } from "../types/type";

interface ChatState {
  chatsByTask: Record<string, Chat[]>;
  setAllTaskChats: (allChatsData: Record<string, Chat[]>) => void;
  setChatsForTask: (taskId: string, chats: Chat[]) => void;
  addChatToTask: (taskId: string, chat: Chat) => void;
  updateChat: (taskId: string, parentChatId: string | null, targetChatId: string, patch: Partial<Chat>) => void;
  deleteChat: (taskId: string, chatId: string) => void;
}

// 재귀적으로 부모 채팅을 찾아 답글을 추가하는 헬퍼 함수
const addReplyToParent = (chats: Chat[], parentId: string, newReply: Chat): Chat[] => {
  return chats.map(chat => {
    if (chat.chatId === parentId) {
      // 부모를 찾았으면, replies 배열을 복사하고 새 답글 추가
      return {
        ...chat,
        replies: [...(chat.replies || []), newReply].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), // 시간순 정렬 추가
      };
    }
    if (chat.replies && chat.replies.length > 0) {
      // 현재 채팅이 부모가 아니면, 자식 replies에서 재귀적으로 탐색
      const updatedReplies = addReplyToParent(chat.replies, parentId, newReply);
      // replies가 변경되었다면 (즉, 하위 어딘가에 추가되었다면) 현재 chat 객체도 새로 만들어야 함
      if (updatedReplies !== chat.replies) {
        return { ...chat, replies: updatedReplies };
      }
    }
    return chat; // 변경 없으면 그대로 반환
  });
};

const useChatStore = create<ChatState>((set, _get) => ({
  chatsByTask: {},
  setAllTaskChats: (allChatsData) =>
    set(() => ({ chatsByTask: allChatsData })),
  setChatsForTask: (taskId, chats) =>
    set((s) => ({ chatsByTask: { ...s.chatsByTask, [taskId]: chats } })),
  addChatToTask: (taskId, newChat) => {
    set(state => {
      const currentTaskChats = state.chatsByTask[taskId] || [];
      let updatedTaskChats;

      if (newChat.parentChatId) {
        // 답글인 경우
        updatedTaskChats = addReplyToParent(currentTaskChats, newChat.parentChatId, newChat);
      } else {
        // 최상위 댓글인 경우
        updatedTaskChats = [...currentTaskChats, newChat].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }

      return {
        chatsByTask: {
          ...state.chatsByTask,
          [taskId]: updatedTaskChats,
        },
      };
    });
  },
  updateChat: (taskId: string, parentChatId: string | null, targetChatId: string, patch: Partial<Chat>) =>
    set((state) => {
      const taskChats = state.chatsByTask[taskId];
      if (!taskChats) return state;

      const updatedTaskChats = taskChats.map(chat => {
        // 1. 최상위 채팅 자체가 업데이트 대상인 경우 (parentChatId === null)
        if (parentChatId === null && chat.chatId === targetChatId) {
          return { ...chat, ...patch };
        }

        // 2. 최상위 채팅의 답글(ChatReply가 다루는 replies)이 업데이트 대상인 경우
        if (chat.chatId === parentChatId && chat.replies) { // parentChatId는 이 chat의 ID
          const updatedReplies = chat.replies.map(reply => {
            if (reply.chatId === targetChatId) { // targetChatId는 이 reply의 ID
              return { ...reply, ...patch }; // ★★★ 새로운 답글 객체로 교체
            }
            // 2-1. 답글의 답글이 업데이트 대상인 경우 (재귀적으로 처리 필요)
            // 이 부분은 ChatReply가 또 다른 ChatReply를 렌더링하는 경우에 해당
            if (reply.replies && reply.replies.length > 0) {
              // 여기서 재귀 함수를 호출하거나, updateChat을 다시 호출하는 로직 필요
              // (이 예시에서는 한 단계 답글만 고려)
              // const updatedSubReplies = updateNestedReplies(reply.replies, targetChatId, patch);
              // return { ...reply, replies: updatedSubReplies };
            }
            return reply;
          });
          return { ...chat, replies: updatedReplies };
        }
        return chat;
      });

      return {
        chatsByTask: {
          ...state.chatsByTask,
          [taskId]: updatedTaskChats,
        },
      };
    }),
  deleteChat: (taskId, chatId) =>
    set((s) => ({
      chatsByTask: {
        ...s.chatsByTask,
        [taskId]: s.chatsByTask[taskId].filter((c) => c.chatId !== chatId),
      },
    })),
}));

export default useChatStore;