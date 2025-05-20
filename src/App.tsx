import React, { useState } from 'react';
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

function App() {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<"expanded" | "collapsed" | "hidden">("hidden");
  return (
    <>
      <BrowserRouter>
        <div style={{
          height: 80,
          width: '100%',
          backgroundColor: 'black',
          color: 'white',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 400
        }}>헤더</div>
        {isSideMenuOpen !== 'hidden' && (
          <div style={{
            position: 'fixed',
            top: 80,
            left: 0,
            width: `${isSideMenuOpen === 'expanded' ? '260px' : '86px'}`,
            height: '100%',
            transition: 'padding-left 0.3s ease, width 0.3s ease',
            borderRight: '1px solid #E4E8EE'
          }}
            onClick={() => {
              setIsSideMenuOpen(isSideMenuOpen === 'expanded' ? 'collapsed' : 'expanded')
            }}
          >
            사이드 메뉴
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={React.createElement("kanban-board", {
              tasks: JSON.stringify(sectionTasks),
              sections: JSON.stringify(sections),
              statuslist: JSON.stringify(statusSelect),
              currentUser: JSON.stringify(user1),
              userlist: JSON.stringify(userlist),
              isSideMenuOpen: 'hidden',
              chatlist: JSON.stringify(chatlist),
            })}
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
