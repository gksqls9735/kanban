import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import "./web-component/kanban-web-component";
import { sections, sectionTasks } from './mocks/task-mock';
import { statusSelect } from './mocks/select-option-mock';
import { user1, userlist } from './mocks/user-mock';
import { chatlist } from './mocks/task-detail-mock';
import './styles/datetimepicker.css';
import './styles/task-detail.css';
import './styles/participant-selector.css';
import './styles/kanban.css';
import { Chat, Section, SelectOption, Task } from './types/type';

function App() {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<"expanded" | "collapsed" | "hidden">("hidden");

  const kanbanRef = useRef<any>(null);

  const [appTasks, setAppTasks] = useState<Task[]>(sectionTasks);
  const [appSections, setAppSections] = useState<Section[]>(sections);
  const [appStatusList, setAppStatusList] = useState<SelectOption[]>(statusSelect);

  // 전체 채팅 목록을 관리하는 상태
  const [globalChatlist, setGlobalChatlist] = useState<Chat[]>(chatlist);
  // 현재 상세보기 중인 태스크의 채팅 목록
  const [currentTaskChatList, setCurrentTaskChatList] = useState<Chat[]>([]);
  // 현재 상세보기 중인 태스크의 ID
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);


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
    console.log("Chats updated for current task from WC:", updatedChatsForCurrentTask);

    if (selectedTaskId) {
      const otherTasksChats = globalChatlist.filter(chat => chat.taskId !== selectedTaskId);
      const newGlobalChatlist = [...otherTasksChats, ...updatedChatsForCurrentTask];
      setGlobalChatlist(newGlobalChatlist);

      setCurrentTaskChatList(updatedChatsForCurrentTask);
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

  // selectedTaskId가 변경되면 currentTaskChatList를 업데이트하는 useEffect (선택적 개선)
  useEffect(() => {
    if (selectedTaskId) {
      const chatsForSelectedTask = globalChatlist.filter(chat => chat.taskId === selectedTaskId);
      setCurrentTaskChatList(chatsForSelectedTask);
    } else {
      setCurrentTaskChatList([]); // 선택된 태스크가 없으면 빈 배열
    }
  }, [selectedTaskId, globalChatlist]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={React.createElement("kanban-board", {
              ref: kanbanRef,
              tasks: JSON.stringify(appTasks),
              sections: JSON.stringify(appSections),
              statuslist: JSON.stringify(appStatusList),
              currentUser: JSON.stringify(user1),
              userlist: JSON.stringify(userlist),
              isSideMenuOpen: 'hidden',
              chatlist: JSON.stringify(currentTaskChatList),
            })}
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
