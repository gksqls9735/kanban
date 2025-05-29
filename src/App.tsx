import React, { useEffect, useRef, useState } from 'react';
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


  useEffect(() => {
    const kanbanElement = kanbanRef.current;

    const onTasksChanged = (e: CustomEvent<Task[]>) => {
      console.log("Tasks updated from WC:", e.detail);
      setAppTasks(e.detail);
    };
    const onSectionsChanged = (e: CustomEvent<Section[]>) => {
      console.log("Sections updated:", e.detail);
      setAppSections(e.detail);
    };
    const onChatlistChanged = (e: CustomEvent<Chat[]>) => {
      const updatedChatsForCurrentTask = e.detail;
      console.log("Chats updated for current task from WC:", updatedChatsForCurrentTask);

      if (selectedTaskId) {
        const otherTasksChats = globalChatlist.filter(chat => chat.taskId !== selectedTaskId);
        const newGlobalChatlist = [...otherTasksChats, ...updatedChatsForCurrentTask];
        setGlobalChatlist(newGlobalChatlist);

        setCurrentTaskChatList(updatedChatsForCurrentTask);
      }
    };
    const onStatusChanged = (e: CustomEvent<SelectOption[]>) => {
      console.log("Status updated: ", e.detail);
      setAppStatusList(e.detail);
    };
    const onDetailTaskSelected = (e: CustomEvent<string>) => {
      const taskId = e.detail;
      console.log("Detail task selected from WC:", taskId);
      setSelectedTaskId(taskId); // 현재 선택된 태스크 ID 저장

      // 전체 채팅 목록에서 해당 태스크의 채팅만 필터링하여 현재 채팅 목록으로 설정
      const chatsForSelectedTask = globalChatlist.filter(chat => chat.taskId === taskId);
      setCurrentTaskChatList(chatsForSelectedTask);
    };

    kanbanElement?.addEventListener("tasksChanged", onTasksChanged as EventListener);
    kanbanElement?.addEventListener("sectionsChanged", onSectionsChanged as EventListener);
    kanbanElement?.addEventListener("chatlistChanged", onChatlistChanged as EventListener);
    kanbanElement?.addEventListener("statuslistChanged", onStatusChanged as EventListener);
    kanbanElement?.addEventListener("selectedDetailTask", onDetailTaskSelected as EventListener);

    return () => {
      kanbanElement?.removeEventListener("tasksChanged", onTasksChanged as EventListener);
      kanbanElement?.removeEventListener("sectionsChanged", onSectionsChanged as EventListener);
      kanbanElement?.removeEventListener("chatlistChanged", onChatlistChanged as EventListener);
      kanbanElement?.removeEventListener("statuslistChanged", onStatusChanged as EventListener);
      kanbanElement?.removeEventListener("selectedDetailTask", onDetailTaskSelected as EventListener);
    };
  }, [globalChatlist, selectedTaskId]);

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
