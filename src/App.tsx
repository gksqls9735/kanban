import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import "./web-component/kanban-web-component";

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={React.createElement("kanban-board", { test: "Create KanbanBoard Project" })}
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
