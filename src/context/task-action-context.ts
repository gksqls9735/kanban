// contexts/TaskSelectionContext.ts
import { createContext, useContext } from 'react';

interface TaskSelectionContextType {
  onSelectTaskId?: (taskId: string) => void; // 단일 taskId를 받는다고 가정
}

// Context 생성 시 기본값 설정
// Provider 외부에서 호출될 경우를 대비하여 경고 메시지를 포함하거나 빈 함수를 넣을 수 있습니다.
const TaskSelectionContext = createContext<TaskSelectionContextType>({
  onSelectTaskId: (taskId) => {
    console.warn('onSelectTaskId function was called without a TaskSelectionContext.Provider', taskId);
  }
});

// Context를 쉽게 사용하기 위한 커스텀 훅 (선택 사항이지만 권장)
export const useTaskSelection = () => {
  return useContext(TaskSelectionContext);
};

export default TaskSelectionContext;