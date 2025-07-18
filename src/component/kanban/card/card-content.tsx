import React from "react";
import { Task } from "../../../types/type";
import { formatDateToYyMmDd } from "../../../utils/date-function";
import TodoList from "../card-todo/todolist";
import CardHeader from "./component/card-header";
import CardMeta from "./component/card-meta";
import CardParticipants from "./component/card-participants";
import isEqual from "lodash.isequal";

import CalendarIcon from "../../../assets/tabler-icon-calendar-event.svg?react";

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
        <CalendarIcon width="16" height="16" />
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