import { create } from "zustand";
import { Chat } from "../types/type";

interface ChatState {
  chatsByTask: Record<string, Chat[]>;
  setAllTaskChats: (allChatsData: Record<string, Chat[]>) => void;
  setChatsForTask: (taskId: string, chats: Chat[]) => void;
  addChatToTask: (taskId: string, chat: Chat) => void;
  updateChat: (taskId: string, targetChatId: string, patch: Partial<Chat>) => void;
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

  updateChat: (taskId: string, targetChatId: string, patch: Partial<Chat>) =>
    set((state) => {
      const taskChats = state.chatsByTask[taskId];
      if (!taskChats) return state;

      const precessAndUpdateChats = (currentChats: Chat[], idToUpdate: string, patchData: Partial<Chat>,
      ): { updatedChats: Chat[], changed: boolean } => {
        let hasChangedInThisLevel = false;

        const mappedChats = currentChats.map(chat => {
          if (chat.chatId === idToUpdate) {
            hasChangedInThisLevel = true;
            return { ...chat, ...patchData };
          }

          if (chat.replies && chat.replies.length > 0) {
            const result = precessAndUpdateChats(chat.replies, idToUpdate, patchData);
            if (result.changed) {
              hasChangedInThisLevel = true;
              return { ...chat, replies: result.updatedChats };
            }
          }

          return chat;
        });

        if (hasChangedInThisLevel) {
          return { updatedChats: mappedChats, changed: true };
        } else {
          return { updatedChats: currentChats, changed: false };
        }
      };

      const result = precessAndUpdateChats(taskChats, targetChatId, patch);

      if (result.changed) {
        return {
          chatsByTask: {
            ...state.chatsByTask,
            [taskId]: result.updatedChats,
          }
        };
      }

      return state;
    }),

  deleteChat: (taskId, chatId) =>
    set((state) => {
      const taskChats = state.chatsByTask[taskId];
      if (!taskChats) return state;

      // 재귀적으로 채팅 삭제
      // 삭제 대상이 아닌 경우 chat, 삭제 대상이면 null 반환
      const transformOrRemoveRecursive = (chats: Chat[], idToDelete: string): Chat[] => {
        return chats.map(chat => {
          // 현재 chat이 삭제 대상인지 확인
          if (chat.chatId === idToDelete) return null;

          // 현재 chat이 삭제 대상이 아니고 답글이 있는 경우 답글 처리
          if (chat.replies && chat.replies.length > 0) {
            const updatedReplies = transformOrRemoveRecursive(chat.replies, idToDelete);

            // 답글 목록에 변화 확인
            if (updatedReplies.length !== (chat.replies).length ||
              updatedReplies.some((reply, index) => reply !== (chat.replies as Chat[])[index])) {
              return { ...chat, replies: updatedReplies };
            }
          }
          return chat;
        }).filter(chat => chat !== null) as Chat[];
      };

      const updatedTaskChats = transformOrRemoveRecursive(taskChats, chatId);

      // 실제로 변경이 있었는지 확인 (선택적 최적화)
      if (updatedTaskChats.length !== taskChats.length ||
        updatedTaskChats.some((chat, index) => chat !== taskChats[index])) {
        return {
          chatsByTask: {
            ...state.chatsByTask,
            [taskId]: updatedTaskChats,
          },
        };
      }
      return state;
    }),
}));

export default useChatStore;