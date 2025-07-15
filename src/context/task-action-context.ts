// contexts/TaskSelectionContext.ts
import { createContext, useContext } from 'react';
import { Chat, Section, SelectOption, Task } from '../types/type';

export interface KanbanActionsContextType {
  onTaskAdd?: (task: Task) => void;
  onTasksChange?: (tasks: Task[]) => void;
  onTasksDelete?: (taskId: string) => void;
  onSectionsChange?: (sections: Section[]) => void;
  onSectionDelete?: (sectionId: string) => void;
  onStatusesChange?: (statusList: SelectOption[]) => void;
  onChatlistChange?: (chats: Chat[]) => void;
  onSelectTaskId?: (taskId: string) => void; // 단일 taskId를 받는다고 가정
  onFileStateChange?: (ownerId: string, ownerType: 'chat' | 'task', addedFiles: File[], deletedIds: string[]) => void;
}

// Context 생성 시 기본값 설정
// Provider 외부에서 호출될 경우를 대비하여 경고 메시지를 포함하거나 빈 함수를 넣을 수 있습니다.
const KanbanActionsContext = createContext<KanbanActionsContextType>({
  onTaskAdd: (task) => {
    console.warn('onTaskAdd function was called without a KanbanActionsContext.Provider', task);
  },
  onTasksChange: (tasks) => {
    console.warn('onTasksChange function was called without a KanbanActionsContext.Provider', tasks);
  },
  onTasksDelete: (taskId) => {
    console.warn('onTasksDelete function was called without a KanbanActionsContext.Provider', taskId);
  },
  onSectionsChange: (sections) => {
    console.warn('onSectionsChange function was called without a KanbanActionsContext.Provider', sections);
  },
  onSectionDelete: (sectionId) => {
    console.warn('onSectionDelete function was called without a KanbanActionsContext.Provider', sectionId);
  },
  onStatusesChange: (statusList) => {
    console.warn('onStatusesChange function was called without a KanbanActionsContext.Provider', statusList);
  },
  onChatlistChange: (chats) => {
    console.warn('onChatlistChange function was called without a KanbanActionsContext.Provider', chats);
  },
  onSelectTaskId: (taskId) => {
    console.warn('onSelectTaskId function was called without a KanbanActionsContext.Provider', taskId);
  },
  onFileStateChange: (ownerId: string, ownerType: 'chat' | 'task', addedFiles: File[], deletedIds: string[]) => {
    console.warn('onFileStateChange function was called without a GanttActionsContext.Provider', ownerId, ownerType, addedFiles, deletedIds);
  },
});

// Context를 쉽게 사용하기 위한 커스텀 훅 (선택 사항이지만 권장)
export const useKanbanActions = () => {
  return useContext(KanbanActionsContext);
};

export default KanbanActionsContext;