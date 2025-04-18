import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import "./web-component/kanban-web-component";
import { sections, sectionTasks } from './mocks/task-mock';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={React.createElement("kanban-board", {
              tasks: JSON.stringify(sectionTasks),
              sections: JSON.stringify(sections)
            })}
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
