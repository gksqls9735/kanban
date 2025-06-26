// Kanban.tsx
import { useEffect, useRef } from "react";
import ColumnList from "../component/kanban/column/column-list";
import { Chat, Section, SelectOption, Task, User } from "../types/type";
import { DndContext, DragOverlay, rectIntersection } from "@dnd-kit/core";
import useViewModeStore from "../store/viewmode-store";
import { ViewModes } from "../constants";
import useTaskStore from "../store/task-store";
import { useKanbanDnd } from "../hooks/dnd/use-task-dnd";
import DroppableColumn from "../component/kanban/column/droppable-column";
import useStatusesStore from "../store/statuses-store";
import useSectionsStore from "../store/sections-store";
import CardWrapper from "../component/kanban/card/card-wrapper";
import useUserStore from "../store/user-store";
import { ToastProvider } from "../context/toast-context";
import useChatStore from "../store/chat-store";
import { useKanbanActions } from "../context/task-action-context";
import { statusSelect } from "../mocks/select-option-mock";
import isEqual from "lodash.isequal";

export interface KanbanProps {
  currentUser: User | null;
  userlist: User[];
  tasks: Task[];
  sections: Section[];
  statusList: SelectOption[];
  isSideMenuOpen: "expanded" | "collapsed" | "hidden";
  chatlist: Chat[]; // Chat 타입은 replies 속성이 없는 플랫한 타입
  detailModalTopPx?: number;
}

const Kanban: React.FC<KanbanProps> = ({
  currentUser: initialCurrentUser,
  userlist: initialUserlist,
  tasks: initialTasks,
  sections: initialSections,
  statusList: initialStatusList,
  isSideMenuOpen,
  chatlist, // 이 chatlist는 이제 플랫한 배열로 넘어온다고 가정
  detailModalTopPx = 0,
}) => {
  useEffect(() => {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!chatlist: ", chatlist)
  }, [chatlist]);
  const { viewMode, setViewMode } = useViewModeStore();
  const setTasks = useTaskStore(state => state.setTasks);
  const sections = useSectionsStore(state => state.sections);
  const setSections = useSectionsStore(state => state.setSections);
  const setStatusList = useStatusesStore(state => state.setStatusList);

  const setCurrentUser = useUserStore(state => state.setCurrentUser);
  const setUserlist = useUserStore(state => state.setUserlist);

  // useChatStore에서 allChats (플랫한 모든 채팅 데이터)를 가져옵니다.
  const allChatsInStore = useChatStore(state => state.allChats);
  const setInitialChats = useChatStore(state => state.setInitialChats);
  const { onChatlistChange } = useKanbanActions();

  const {
    sensors, activeTask, activeColumn, placeholderData, handleDragStart, handleDragOver, handleDragEnd, handleDragCancel
  } = useKanbanDnd();

  useEffect(() => {
    if (initialTasks.length > 0) {
      const sortedTasks = initialTasks.sort((a, b) => (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0));
      setTasks(sortedTasks);
    }
  }, [initialTasks, setTasks]);

  useEffect(() => {
    const sortedSections = initialSections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setSections(sortedSections);
  }, [initialSections, setSections]);

  useEffect(() => {
    if (initialStatusList && initialStatusList.length > 0) {
      setStatusList(initialStatusList);
    } else {
      setStatusList(statusSelect);
    }
  }, [initialStatusList, setStatusList]);

  useEffect(() => {
    if (initialCurrentUser) {
      setCurrentUser(initialCurrentUser);
    }
  }, [initialCurrentUser, setCurrentUser]);

  useEffect(() => {
    if (initialUserlist && initialUserlist.length > 0) {
      setUserlist(initialUserlist)
    }
  }, [initialUserlist, setUserlist]);

  // ★★★ 채팅: 외부에서 넘어온 초기 chatlist를 useChatStore에 설정합니다.
  // 이 useEffect는 chatlist prop이 변경될 때마다 실행되도록 의존성 배열을 [chatlist]로 설정합니다.
  useEffect(() => {
    console.log("DEBUG: Kanban -> Initial chatlist useEffect triggered.");
    if (chatlist && chatlist.length > 0) {
      console.log("DEBUG: Kanban -> Calling setInitialChats with chatlist:", chatlist);
      setInitialChats(chatlist);
    } else {
      console.log("DEBUG: Kanban -> Calling setInitialChats with empty array.");
      setInitialChats([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatlist]); // ★★★ 의존성 배열을 [chatlist]로 변경합니다.

  // ★★★ 채팅 데이터 변경 감지 로직 (기존 로직 유지, 감시대상만 변경)
  // useChatStore의 allChats 상태를 감시하고, 변경 시 onChatlistChange를 호출합니다.
  // isEqual을 사용하여 깊은 비교를 수행함으로써 불필요한 렌더링/루프를 방지합니다.
  const prevAllChatsRef = useRef<Chat[]>([]);

  useEffect(() => {
    console.log("DEBUG: Kanban -> allChatsInStore change detection useEffect triggered.");
    console.log("DEBUG: Kanban -> prevAllChatsRef.current:", prevAllChatsRef.current);
    console.log("DEBUG: Kanban -> allChatsInStore (current from store):", allChatsInStore);

    // allChatsInStore는 useChatStore의 플랫한 모든 채팅 데이터입니다.
    if (!isEqual(prevAllChatsRef.current, allChatsInStore)) {
      console.log("DEBUG: Kanban -> allChatsInStore reference changed. Updating ref and calling onChatlistChange.");
      prevAllChatsRef.current = allChatsInStore;
      onChatlistChange?.(allChatsInStore); // 변경 시 외부 전달
    } else {
      console.log("DEBUG: Kanban -> allChatsInStore reference is same. No update.");
    }
  }, [allChatsInStore, onChatlistChange]);

  const getSectionName = (sectionId: string): string => {
    return sections.find(sec => sec.sectionId === sectionId)?.sectionName || '';
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === ViewModes.STATUS ? ViewModes.SECTION : ViewModes.STATUS);
  };

  return (
    <ToastProvider>
      <div className="kanban-wrapper"
        style={{
          paddingLeft: `${isSideMenuOpen === 'hidden' ? '' : isSideMenuOpen === 'expanded' ? '260px' : '86px'}`,
          width: `${isSideMenuOpen === 'hidden' ? '100%' : isSideMenuOpen === 'expanded' ? 'calc(100vw - 260px)' : 'calc(100vw - 86px)'}`,
        }}
      >
        <div onClick={toggleViewMode} className="view-toggle">{viewMode === ViewModes.STATUS ? '섹션별로 보기' : '상태별로 보기'}</div>
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className='kanban kanban-scrollbar-x' style={{ width: '100%', overflowX: 'auto', minWidth: 0, }}>
            <ColumnList getSectionName={getSectionName} placeholderData={placeholderData} detailModalTopPx={detailModalTopPx} />
            <DragOverlay>
              {activeTask ? (
                <CardWrapper task={activeTask} sectionName={getSectionName(activeTask.sectionId)} isOverlay={true} />
              ) : activeColumn ? (
                <DroppableColumn
                  columnId={activeColumn.id}
                  title={activeColumn.title}
                  tasks={activeColumn.tasks}
                  getSectionName={activeColumn.getSectionName}
                  colorMain={activeColumn.colorMain}
                  colorSub={activeColumn.colorSub}
                  isOverlay={true}
                  placeholderData={null}
                />
              ) : null}
            </DragOverlay>
          </div>
        </DndContext>
      </div>
    </ToastProvider>
  );
};

export default Kanban;