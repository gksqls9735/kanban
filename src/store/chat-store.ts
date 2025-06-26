import { create } from "zustand";
import { Chat } from "../types/type";

export interface ChatForUI extends Chat {
  replies?: ChatForUI[];
}

interface ChatState {
  allChats: Chat[];  // 모든 채팅을 플랫하게 저정(원본 데이터)
  chatsById: Record<string, Chat>; // 성능을 위해 ID로 접근 가능한 맵

  setInitialChats: (initialChats: Chat[]) => void;
  addChat: (newChat: Chat) => void;
  updateChat: (targetChatId: string, patch: Partial<Chat>) => void;
  deleteChat: (chatIdToDelete: string) => void;
}

// 모든 채팅을 플랫한 배열에서 받아, 특정 parentId를 가진 채팅들로 트리 구조를 재귀적으로 생성
export const buildChatTreeRecursive = (chats: Chat[], parentId: string | null = null): ChatForUI[] => {
  const children = chats
    .filter(chat => chat.parentChatId === parentId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return children.map(chat => ({
    ...chat, replies: buildChatTreeRecursive(chats, chat.chatId)
  }));
};

const useChatStore = create<ChatState>((set, _get) => ({
  allChats: [],
  chatsById: {},

  setInitialChats: (initialChats) => {
    const newChatsById: Record<string, Chat> = {};
    initialChats.forEach(chat => { newChatsById[chat.chatId] = chat });
    set({ allChats: initialChats, chatsById: newChatsById });
  },

  addChat: (newChat) => set((state) => {
    const updatedAllChats = [...state.allChats, newChat];
    const updatedChatsById = { ...state.chatsById, [newChat.chatId]: newChat };
    return { allChats: updatedAllChats, chatsById: updatedChatsById };
  }),

  updateChat: (targetChatId: string, patch: Partial<Chat>) =>
    set((state) => {
      const existingChat = state.chatsById[targetChatId];
      if (!existingChat) {
        console.warn(`Chat with ID ${targetChatId} not found for update.`);
        return state;
      }

      const updatedChat = { ...existingChat, ...patch };
      const updatedAllChats = state.allChats.map(chat => chat.chatId === targetChatId ? updatedChat : chat);
      const updatedChatsById = { ...state.chatsById, [targetChatId]: updatedChat };

      return { allChats: updatedAllChats, chatsById: updatedChatsById };
    }),

  deleteChat: (chatIdToDelete: string) =>
    set((state) => {
      const chatsById = { ...state.chatsById };
      const chatsToDelete: Set<string> = new Set();

      const findChatsToDelete = (currentChatId: string) => {
        chatsToDelete.add(currentChatId);
        for (const chat of Object.values(chatsById)) {
          if (chat.parentChatId === currentChatId) findChatsToDelete(chat.chatId);
        }
      };

      if (chatsById[chatIdToDelete]) {
        findChatsToDelete(chatIdToDelete);
      } else {
        console.warn(`Chat with ID ${chatIdToDelete} not found for deletion.`);
        return state;
      }

      const updatedAllChats = state.allChats.filter(chat => !chatsToDelete.has(chat.chatId));
      chatsToDelete.forEach(id => delete chatsById[id]);

      return { allChats: updatedAllChats, chatsById: chatsById };
    }),
}));

export default useChatStore;