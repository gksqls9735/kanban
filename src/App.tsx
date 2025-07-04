import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import "./web-component/kanban-web-component";
import { sections, sectionTasks } from './mocks/task-mock';
import { statusSelect } from './mocks/select-option-mock';
import { user1, userlist } from './mocks/user-mock';
import { globalChatlist as initialGlobalChatlist } from './mocks/task-detail-mock';
import './styles/datetimepicker.css';
import './styles/task-detail.css';
import './styles/participant-selector.css';
import './styles/kanban.css';
import { Chat, Section, SelectOption, Task } from './types/type';
import { KanbanWebComponentElement } from './global';
import { faChartBar, faGear, faHouse } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function App() {
  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed">("expanded");
  const [activeMenu, setActiveMenu] = useState('홈');

  // 사이드바 토글 핸들러
  const toggleSidebar = () => {
    setSidebarState(prev => (prev === "expanded" ? "collapsed" : "expanded"));
  };

  // 상태에 따른 사이드바 스타일 동적 생성
  const getSidebarStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = { ...styles.sidebar };

    if (sidebarState === 'collapsed') {
      style.width = '60px'; // 닫혔을 때 너비 (아이콘만 보일 정도)
    }
    return style;
  };

  const menuItems = [
    { icon: faHouse, name: '홈' },
    { icon: faChartBar, name: '대시보드' },
    { icon: faGear, name: '설정' },
  ];

  const kanbanRef = useRef<KanbanWebComponentElement>(null);

  const [appTasks, setAppTasks] = useState<Task[]>(sectionTasks);
  const [appSections, setAppSections] = useState<Section[]>(sections);
  const [appStatusList, setAppStatusList] = useState<SelectOption[]>(statusSelect);

  // 전체 채팅 목록을 관리하는 상태
  const [globalChatlist, setGlobalChatlist] = useState<Chat[]>(initialGlobalChatlist);
  // 현재 상세보기 중인 태스크의 채팅 목록
  const [currentTaskChatList, setCurrentTaskChatList] = useState<Chat[]>([]);
  // 현재 상세보기 중인 태스크의 ID
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);


  useEffect(() => {
    if (selectedTaskId) {
      const chatsForSelectedTask = globalChatlist.filter(chat => chat.taskId === selectedTaskId);
      console.warn("chatsForSelectedTask: ", chatsForSelectedTask)
      setCurrentTaskChatList(chatsForSelectedTask);
    } else {
      setCurrentTaskChatList([]);
    }
  }, [selectedTaskId, globalChatlist]);

  useEffect(() => {
    const kanbanElement = kanbanRef.current;
    if (!kanbanElement) return;

    kanbanElement.currentUser = user1;
    kanbanElement.userlist = userlist;
    kanbanElement.tasks = appTasks;
    kanbanElement.sections = appSections;
    kanbanElement.statusList = appStatusList;
    kanbanElement.chatlist = currentTaskChatList;

    kanbanElement.setAttribute('detailmodaltoppx', '80');
  }, [appTasks, appSections, appStatusList, currentTaskChatList, kanbanRef]);

  // 작업 이벤트
  const onKanbanTaskAdded = useCallback((e: CustomEvent<{ task: Task }>) => {
    console.log("WC Evene: kanban-task-added", e.detail.task);
    setAppTasks(prev => [...prev, e.detail.task]);
  }, []);

  const onKanbanTaskUpdated = useCallback((e: CustomEvent<{ tasks: Task[] }>) => {
    const updatedTasksArray = e.detail.tasks;
    console.log("WC Event: kanban-tasks-updated", e.detail.tasks);

    setAppTasks(prev => {
      const tasksMap = new Map(updatedTasksArray.map(t => [t.taskId, t]));
      return prev.map(t => tasksMap.get(t.taskId) || t);
    });
  }, []);

  const onKanbanTaskDeleted = useCallback((e: CustomEvent<{ taskId: string }>) => {
    console.log("WC Event: kanban-tasks-deleted", e.detail.taskId);

    setAppTasks(prev => prev.filter(t => t.taskId !== e.detail.taskId));
    if (selectedTaskId === e.detail.taskId) setSelectedTaskId(null);
  }, [selectedTaskId]);

  // 섹션
  const onKanbanSectionsUpdated = useCallback((e: CustomEvent<{ sections: Section[] }>) => {
    console.log("WC Event: kanban-sections-updated", e.detail.sections);
    setAppSections(e.detail.sections);
  }, []);

  const onKanbanSectionDeleted = useCallback((e: CustomEvent<{ sectionId: string }>) => {
    console.log("WC Event: kanban-section-deleted", e.detail.sectionId);
    const { sectionId } = e.detail;
    setAppSections(prev => prev.filter(sec => sec.sectionId !== sectionId));
    const alsoDeletedTaskIds = appTasks.filter(t => t.sectionId === sectionId).map(t => t.taskId);
    if (alsoDeletedTaskIds && alsoDeletedTaskIds.length > 0) {
      const deletedIdsSet = new Set(alsoDeletedTaskIds);
      setAppTasks(prev => prev.filter(t => !deletedIdsSet.has(t.taskId)));

      if (selectedTaskId && deletedIdsSet.has(selectedTaskId)) setSelectedTaskId(null);
    }
  }, [appTasks, selectedTaskId, setAppSections, setAppTasks, setSelectedTaskId]);

  // 상태
  const onKanbanStatusDefinitionsUpdated = useCallback((e: CustomEvent<{ statusOptions: SelectOption[] }>) => {
    console.log("WC Event: kanban-status-definitions-updated", e.detail.statusOptions);
    setAppStatusList(e.detail.statusOptions);
  }, []);

  // 채팅
  const onKanbanTaskChatsUpdated = useCallback((e: CustomEvent<{ chats: Chat[] }>) => {
    const updatedChatsForCurrentTask = e.detail.chats;
    console.warn("Chats updated for current task from WC:", updatedChatsForCurrentTask);

    if (selectedTaskId) {
      setGlobalChatlist(prev => {
        const otherTasksChats = prev.filter(chat => chat.taskId !== selectedTaskId);
        return [...otherTasksChats, ...updatedChatsForCurrentTask];
      });
    }
  }, [selectedTaskId]);

  // 작업 선택
  const onKanbanTaskSelected = useCallback((e: CustomEvent<{ taskId: string | null }>) => {
    const newSelectedTaskId = e.detail.taskId;
    console.log("WC Event: kanban-task-selected", newSelectedTaskId);
    setSelectedTaskId(newSelectedTaskId);
  }, []);

  useEffect(() => {
    const kanbanElement = kanbanRef.current;
    if (!kanbanElement) return;

    kanbanElement.addEventListener("kanban-task-added", onKanbanTaskAdded as EventListener);
    kanbanElement.addEventListener("kanban-task-updated", onKanbanTaskUpdated as EventListener);
    kanbanElement.addEventListener("kanban-task-deleted", onKanbanTaskDeleted as EventListener);
    kanbanElement.addEventListener("kanban-sections-updated", onKanbanSectionsUpdated as EventListener);
    kanbanElement.addEventListener("kanban-section-deleted", onKanbanSectionDeleted as EventListener);
    kanbanElement.addEventListener("kanban-status-definitions-updated", onKanbanStatusDefinitionsUpdated as EventListener);
    kanbanElement.addEventListener("kanban-task-chats-updated", onKanbanTaskChatsUpdated as EventListener);
    kanbanElement.addEventListener("kanban-task-selected", onKanbanTaskSelected as EventListener);

    return () => {
      kanbanElement.removeEventListener("kanban-task-added", onKanbanTaskAdded as EventListener);
      kanbanElement.removeEventListener("kanban-task-updated", onKanbanTaskUpdated as EventListener);
      kanbanElement.removeEventListener("kanban-task-deleted", onKanbanTaskDeleted as EventListener);
      kanbanElement.removeEventListener("kanban-sections-updated", onKanbanSectionsUpdated as EventListener);
      kanbanElement.removeEventListener("kanban-section-deleted", onKanbanSectionDeleted as EventListener);
      kanbanElement.removeEventListener("kanban-status-definitions-updated", onKanbanStatusDefinitionsUpdated as EventListener);
      kanbanElement.removeEventListener("kanban-task-chats-updated", onKanbanTaskChatsUpdated as EventListener);
      kanbanElement.removeEventListener("kanban-task-selected", onKanbanTaskSelected as EventListener);
    };

  }, [
    onKanbanTaskAdded, onKanbanTaskUpdated, onKanbanTaskDeleted,
    onKanbanSectionsUpdated, onKanbanStatusDefinitionsUpdated,
    onKanbanTaskChatsUpdated, onKanbanTaskSelected,
  ]);


  return (
    <>
      <div style={styles.header}>
        헤더 영역
      </div>

      <div style={styles.layoutContainer}>
        {/* 동적으로 스타일이 변경되는 사이드바 */}
        <div style={getSidebarStyle()}>

          <div style={styles.sidebarContent}>
            <h2 style={{ ...styles.sidebarTitle, opacity: sidebarState === 'expanded' ? 1 : 0 }}>
              프로젝트
            </h2>
            <ul style={styles.sidebarMenu}>
              {menuItems.map((item) => (
                <li
                  key={item.name}
                  style={activeMenu === item.name ? { ...styles.menuItem, ...styles.menuItemActive } : styles.menuItem}
                  onClick={() => setActiveMenu(item.name)}
                >
                  <span style={styles.menuIcon}>
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <span style={{ ...styles.menuText, opacity: sidebarState === 'expanded' ? 1 : 0 }}>
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 토글 버튼은 항상 사이드바 하단에 위치 */}
          <button onClick={toggleSidebar} style={styles.toggleButton}>
            {sidebarState === "expanded" ? '◀ 접기' : '▶'}
          </button>
        </div>

        <div style={styles.contentArea}>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <kanban-board
                    ref={kanbanRef}
                    detailModalTopPx={80}
                  />
                }
              />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </>
  )
}

// 스타일 객체
const styles = {
  header: {
    height: 80,
    backgroundColor: 'black',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    fontSize: '20px',
    fontWeight: 'bold',
    zIndex: 10,
  },
  layoutContainer: {
    display: 'flex',
    height: 'calc(100vh - 80px)',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #dee2e6',
    flexShrink: 0,
    transition: 'width 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 12px', // 좌우 패딩을 살짝 줄여서 아이템과 맞춤
  },
  sidebarContent: {
    // 메뉴 컨텐츠를 담는 역할
  },
  sidebarTitle: {
    margin: '0 0 20px 18px', // 아이콘 위치와 맞추기 위해 왼쪽 마진 추가
    fontSize: '18px',
    fontWeight: 600,
    transition: 'opacity 0.2s ease-in-out', // 부드러운 효과
    whiteSpace: 'nowrap', // 텍스트가 줄바꿈되지 않도록 함
  },
  sidebarMenu: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  // 👇 메뉴 아이템 스타일 (가장 중요)
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 0',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '8px',
    transition: 'background-color 0.2s ease',
    overflow: 'hidden', // 텍스트가 삐져나오지 않도록 함
  },
  // 👇 활성화된 메뉴 아이템 스타일
  menuItemActive: {
    backgroundColor: '#e9ecef', // 활성화 시 배경색
    color: '#212529',
    fontWeight: 'bold',
  },
  // 👇 메뉴 아이콘 스타일
  menuIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60px', // 아이콘 영역 너비 고정 (닫혔을 때와 동일하게)
    fontSize: '20px',
  },
  // 👇 메뉴 텍스트 스타일
  menuText: {
    whiteSpace: 'nowrap', // 텍스트가 줄바꿈되지 않도록 함
    transition: 'opacity 0.2s ease-in-out', // 부드러운 효과
  },
  toggleButton: {
    background: '#e9ecef',
    border: '1px solid #dee2e6',
    color: '#495057',
    width: '100%',
    height: '40px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '20px',
    alignSelf: 'center',
  },
  contentArea: {
    flex: 1,
    overflowY: 'auto',
  },
} as const;

export default App;