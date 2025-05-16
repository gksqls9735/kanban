import { create } from "zustand";
import { Chat } from "../types/type";

interface ChatState {
  chatsByTask: Record<string, Chat[]>;
  setAllTaskChats: (allChatsData: Record<string, Chat[]>) => void;
  setChatsForTask: (taskId: string, chats: Chat[]) => void;
  addChatToTask: (taskId: string, chat: Chat) => void;
  updateChat: (taskId: string, chatId: string, patch: Partial<Chat>) => void;
  deleteChat: (taskId: string, chatId: string) => void;
}

const useChatStore = create<ChatState>((set, get) => ({
  chatsByTask: {},
  setAllTaskChats: (allChatsData) =>
    set(() => ({ chatsByTask: allChatsData })),
  setChatsForTask: (taskId, chats) =>
    set((s) => ({ chatsByTask: { ...s.chatsByTask, [taskId]: chats } })),
  addChatToTask: (taskId, chat) =>
    set((s) => ({
      chatsByTask: {
        ...s.chatsByTask,
        [taskId]: [...(s.chatsByTask[taskId] || []), chat],
      },
    })),
  updateChat: (taskId, chatId, patch) =>
    set((s) => ({
      chatsByTask: {
        ...s.chatsByTask,
        [taskId]: s.chatsByTask[taskId].map((c) =>
          c.chatId === chatId ? { ...c, ...patch } : c
        ),
      },
    })),
  deleteChat: (taskId, chatId) =>
    set((s) => ({
      chatsByTask: {
        ...s.chatsByTask,
        [taskId]: s.chatsByTask[taskId].filter((c) => c.chatId !== chatId),
      },
    })),
}));

export default useChatStore;