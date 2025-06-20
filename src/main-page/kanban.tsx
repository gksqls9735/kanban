import { useEffect } from "react";
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

export interface KanbanProps {
  currentUser: User | null;
  userlist: User[];
  tasks: Task[];
  sections: Section[];
  statusList: SelectOption[];
  isSideMenuOpen: "expanded" | "collapsed" | "hidden";
  chatlist: Chat[];
  detailModalTopPx?: number;
}

const Kanban: React.FC<KanbanProps> = ({
  currentUser: initialCurrentUser,
  userlist: initialUserlist,
  tasks: initialTasks,
  sections: initialSections,
  statusList: initialStatusList,
  isSideMenuOpen,
  chatlist,
  detailModalTopPx = 0,
}) => {
  const { viewMode, setViewMode } = useViewModeStore();
  const setTasks = useTaskStore(state => state.setTasks);
  const sections = useSectionsStore(state => state.sections);
  const setSections = useSectionsStore(state => state.setSections);
  const setStatusList = useStatusesStore(state => state.setStatusList);
  // const sectionsLoaded = useSectionsStore(state => state.sections.length > 0);
  // const statusesLoaded = useStatusesStore(state => state.statusList.length > 0);

  const setCurrentUser = useUserStore(state => state.setCurrentUser);
  const setUserlist = useUserStore(state => state.setUserlist);

  const chatsByTask = useChatStore(state => state.chatsByTask);
  const { onChatlistChange } = useKanbanActions();
  const setAllTaskChats = useChatStore(state => state.setAllTaskChats);

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

  useEffect(() => {
    if (chatlist && chatlist.length > 0) {
      const chatsByTaskData: Record<string, Chat[]> = {};
      chatlist.forEach(chat => {
        if (!chatsByTaskData[chat.taskId]) chatsByTaskData[chat.taskId] = [];
        chatsByTaskData[chat.taskId].push(chat);
      });

      for (const taskId in chatsByTaskData) {
        chatsByTaskData[taskId].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }

      setAllTaskChats(chatsByTaskData);
    } else {
      setAllTaskChats({});
    }
  }, [chatlist, setAllTaskChats]);

  useEffect(() => {
    const allChats = Object.values(chatsByTask).flat();
    onChatlistChange?.(allChats);
  }, [chatsByTask]);

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
            <ColumnList getSectionName={getSectionName} placeholderData={placeholderData} detailModalTopPx={detailModalTopPx}/>
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