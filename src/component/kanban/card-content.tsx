import React, { useState } from "react";
import { Task } from "../../types/type";
import { lightenColor } from "../../utils/color-function";
import AvatarGroup from "../avatar/avatar-group";
import useViewModeStore from "../../store/viewmode-store";
import { ViewModes } from "../../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faTimes } from "@fortawesome/free-solid-svg-icons";
import { formatDateToYyyyMmDd } from "../../utils/date-function";

const CardContent: React.FC<{
  task: Task;
  sectionName?: string;
}> = ({ task, sectionName }) => {
  const viewMode = useViewModeStore(state => state.viewMode);
  const [showTodo, setShowTodo] = useState<boolean>(false);

  return (
    <>
      {viewMode === ViewModes.STATUS && (<div className="card-current-section">{sectionName}</div>)}
      <div className="card-title">{task.taskName}</div>
      <div className="card-due-date">
        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#7d8998">
          <path d="M360-300q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
        </svg>
        {formatDateToYyyyMmDd(task.start)} - {formatDateToYyyyMmDd(task.end)}</div>
      <div className="card-meta">
        <div className="card-priority-status">
          <div className="card-priority"
            style={{ color: task.priority.colorMain, backgroundColor: task.priority.colorSub || lightenColor(task.priority.colorMain, 0.85) }}
          >
            {task.priority.name}</div>
          <div className="card-status"
            style={{ color: task.status.colorMain, backgroundColor: task.status.colorSub || lightenColor(task.status.colorMain, 0.85) }}
          >
            {task.status.name}</div>
        </div>
        <div className="card-participant">
          <AvatarGroup list={task.participants || []} maxVisible={3} />
        </div>
      </div>
      {task.todoList.length > 0 && (
        <>
          <div className="seperation-line" />
          <div className="card-todolist">
            <div className="card-todotoggle" onClick={() => setShowTodo(prev => !prev)}>
              <span>할 일</span>
              <span className={`card-todotoggle arrow ${showTodo ? 'arrow--open' : ''}`}>
                <FontAwesomeIcon icon={faCaretDown} style={{ width: 16, height: 16 }} />
              </span>
            </div>
            <div className={`todo-list ${showTodo ? 'todo-list--open' : ''}`}>
              {task.todoList.map(todo => (
                <div key={todo.todoId} className="todo-item">
                  <div className="todo-item__main">
                    <div className="todo-item__checkbox-area">
                      <input
                        type="checkbox"
                        checked={todo.isCompleted}
                        className="todo-item__checkbox--native"
                        id={`todo-${todo.todoId}`}
                        onChange={() => { }}
                      />
                      <label htmlFor={`todo-${todo.todoId}`} className="todo-item__checkbox--visual"></label>
                    </div>
                    <div className={`todo-item__text ${todo.isCompleted ? 'line-through' : ''}`}>
                      {todo.todoTxt}
                    </div>
                  </div>
                  <div className="todo-item__actions">
                    <div className="todo-item__action todo-item__action--delete">
                      <FontAwesomeIcon icon={faTimes} style={{ width: 12, height: 12, color: "rgba(125, 137, 152, 1)" }} />
                    </div>
                    <div className="todo-item__action todo-item__action--drag-handle">
                      ⠿
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

const areEqual = (prevProps: Readonly<{ task: Task; sectionName: string; }>, nextProps: Readonly<{ task: Task; sectionName: string; }>): boolean => {
  const prevTask = prevProps.task;
  const nextTask = nextProps.task;

  if (prevProps.sectionName !== nextProps.sectionName) {
    console.groupEnd();
    return false;
  }

  if (prevTask.taskId !== nextTask.taskId || prevTask.taskName !== nextTask.taskName) return false;


  if (prevTask.start.getTime() !== nextTask.start.getTime() || prevTask.end.getTime() !== nextTask.end.getTime()) return false;

  if (
    prevTask.priority.code !== nextTask.priority.code ||
    prevTask.priority.name !== nextTask.priority.name ||
    prevTask.priority.colorMain !== nextTask.priority.colorMain ||
    prevTask.priority.colorSub !== nextTask.priority.colorSub
  ) {
    return false;
  }

  if (
    prevTask.status.code !== nextTask.status.code ||
    prevTask.status.name !== nextTask.status.name ||
    prevTask.status.colorMain !== nextTask.status.colorMain ||
    prevTask.status.colorSub !== nextTask.status.colorSub
  ) {
    return false;
  }

  const prevParticipants = prevTask.participants || [];
  const nextParticipants = nextTask.participants || [];

  // 6-1. 참여자 수 비교
  if (prevParticipants.length !== nextParticipants.length) {
    console.groupEnd();
    return false;
  }

  for (let i = 0; i < prevParticipants.length; i++) {
    if (prevParticipants[i].id !== nextParticipants[i].id) {
      console.groupEnd();
      return false;
    }
  }

  console.groupEnd();
  return true;
};

export default React.memo(CardContent, areEqual);