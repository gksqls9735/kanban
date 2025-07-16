import React from "react";
import { Task } from "../../../types/type";
import { formatDateToYyMmDd } from "../../../utils/date-function";
import TodoList from "../card-todo/todolist";
import CardHeader from "./component/card-header";
import CardMeta from "./component/card-meta";
import CardParticipants from "./component/card-participants";
import isEqual from "lodash.isequal";

const CardContent: React.FC<{
  task: Task;
  sectionName: string;
  onClick: (e: React.MouseEvent) => void;
  onModalStateChange: (isOpen: boolean) => void;
  isOwnerOrParticipant: boolean;
}> = ({ task, sectionName, onClick, onModalStateChange, isOwnerOrParticipant }) => {
  return (
    <>
      <CardHeader task={task} sectionName={sectionName} onClick={onClick} onModalStateChange={onModalStateChange} isOwnerOrParticipant={isOwnerOrParticipant} />
      <div className="card-title">{task.taskName}</div>
      <div className="card-due-date">
        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#7d8998">
          <path d="M360-300q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
        </svg>
        {formatDateToYyMmDd(task.start)} {task.end ? ` - ${formatDateToYyMmDd(task.end)}` : ' (종료일 미정)'}
      </div>
      <div className="card-meta">
        <CardMeta taskPriority={task.priority} taskStatus={task.status} />
        <CardParticipants taskParticipants={task.participants} onModalStateChange={onModalStateChange} />
      </div>
      {task.todoList.length > 0 && (
        <>
          <div className="seperation-line" />
          <TodoList taskId={task.taskId} todoList={task.todoList} isOwnerOrParticipant={isOwnerOrParticipant} />
        </>
      )}
    </>
  );
};

const areEqual = (prevProps: Readonly<{ task: Task; sectionName: string; onClick: (e: React.MouseEvent) => void; }>, nextProps: Readonly<{ task: Task; sectionName: string; onClick: (e: React.MouseEvent) => void; }>): boolean => {
  if (prevProps.sectionName !== nextProps.sectionName) return false;
  if (!isEqual(prevProps.task, nextProps.task)) return false;
  return true;
};

export default React.memo(CardContent, areEqual);