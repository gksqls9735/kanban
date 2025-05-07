import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import "./web-component/kanban-web-component";
import { sections, sectionTasks } from './mocks/task-mock';
import { statusSelect } from './mocks/select-option-mock';
import { user1, userlist } from './mocks/user-mock';

function App() {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  return (
    <>
      <BrowserRouter>
      <div onClick={() => setIsSideMenuOpen(prev => !prev)}>사이드메뉴 클릭</div>
        <Routes>
          <Route
            path="/"
            element={React.createElement("kanban-board", {
              tasks: JSON.stringify(sectionTasks),
              sections: JSON.stringify(sections),
              statuslist: JSON.stringify(statusSelect),
              currentUser: JSON.stringify(user1),
              userlist: JSON.stringify(userlist),
              isSideMenuOpen: `${isSideMenuOpen}`,
            })}
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
