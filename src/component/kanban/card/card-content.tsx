import React from "react";
import { Task } from "../../../types/type";
import { formatDateToYyyyMmDd } from "../../../utils/date-function";
import TodoList from "../card-todo/todolist";
import CardHeader from "./component/card-header";
import CardMeta from "./component/card-meta";
import CardParticipants from "./component/card-participants";

const CardContent: React.FC<{
  task: Task;
  sectionName: string;
  onClick: () => void;
}> = ({ task, sectionName, onClick }) => {

  return (
    <>
      <CardHeader task={task} sectionName={sectionName} onClick={onClick} />
      <div className="card-title">{task.taskName}</div>
      <div className="card-due-date">
        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#7d8998">
          <path d="M360-300q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
        </svg>
        {formatDateToYyyyMmDd(task.start)} - {formatDateToYyyyMmDd(task.end)}</div>
      <div className="card-meta">
        <CardMeta taskPriority={task.priority} taskStatus={task.status} />
        <CardParticipants taskParticipants={task.participants} />
      </div>
      {task.todoList.length > 0 && (
        <>
          <div className="seperation-line" />
          <TodoList taskId={task.taskId} todoList={task.todoList} />
        </>
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