import React, { useState } from "react";
import useTaskStore from "../../../store/task-store";
import { Task } from "../../../types/type";
import useDropdown from "../../../hooks/use-dropdown";
import { formatDateToYyyyMmDd } from "../../../utils/date-function";
import { lightenColor } from "../../../utils/color-function";
import AvatarGroup from "../../avatar/avatar-group";
import TodoList from "../card-todo/todolist";
import DeleteModal from "../delete-modal";

const CardContent: React.FC<{
  task: Task;
  sectionName?: string;
  onClick: () => void;
}> = ({ task, sectionName, onClick }) => {
  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const deleteTask = useTaskStore(state => state.deletTask);
  const copyTask = useTaskStore(state => state.copyTask);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyTask(task);
    setIsOpen(false);
  };

  const handleDelete = () => {
    deleteTask(task.taskId);
    setIsOpen(false);
  };

  return (
    <>
      <div className="card-header">
        <div className="card-current-section">{sectionName}</div>
        <div className="card-header__actions">
          <div onClick={onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#8D99A8" style={{ padding: 5 }}>
              <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
            </svg>
          </div>
          <div ref={wrapperRef} onClick={toggle}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#8D99A8" style={{ padding: 5 }}>
              <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
            </svg>
          </div>
        </div>
        {isOpen && (
          <div ref={dropdownRef} className="header-dropdown-menu card-header__dropdown-menu">
            <div className="header-dropdown-item" onClick={handleCopy}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-plus-square" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
              </svg>
              작업 복사
            </div>
            <div className="header-dropdown-item" onClick={() => setIsDeleteModalOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
              </svg>
              작업 삭제
            </div>
          </div>
        )}
      </div>
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
          <TodoList taskId={task.taskId} todoList={task.todoList} />
        </>
      )}
      {isDeleteModalOpen && (
        <DeleteModal
          message={'작업을 삭제하시겠습니까?'}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

const areEqual = (prevProps: Readonly<{ task: Task; sectionName: string; onClick: () => void; }>, nextProps: Readonly<{ task: Task; sectionName: string; onClick: () => void; }>): boolean => {

  const prevTask = prevProps.task;
  const nextTask = nextProps.task;

  if (prevProps.sectionName !== nextProps.sectionName) {
    return false;
  }


  if (prevTask.taskId !== nextTask.taskId) {
    return false;
  }


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

  if (prevParticipants.length !== nextParticipants.length) {
    return false;
  }

  for (let i = 0; i < prevParticipants.length; i++) {
    if (prevParticipants[i].id !== nextParticipants[i].id) {
      return false;
    }
  }

  const prevTodoList = prevTask.todoList || [];
  const nextTodoList = nextTask.todoList || [];

  if (prevTodoList.length !== nextTodoList.length) return false;

  for (let i = 0; i < prevTodoList.length; i++) {
    const prevTodo = prevTodoList[i];
    const nextTodo = nextTodoList[i];

    if (
      prevTodo.order !== nextTodo.order ||
      prevTodo.todoTxt !== nextTodo.todoTxt ||
      prevTodo.isCompleted !== nextTodo.isCompleted
    ) { return false; }
  }
  return true;
};

export default React.memo(CardContent, areEqual);