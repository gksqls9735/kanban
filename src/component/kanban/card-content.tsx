import React from "react";
import { Task } from "../../types/type";
import { lightenColor } from "../../utils/color-function";
import { formatKoreanDateSimple } from "../../utils/date-function";
import AvatarGroup from "../avatar/avatar-group";
import useViewModeStore from "../../store/viewmode-store";
import { ViewModes } from "../../constants";

const CardContent: React.FC<{
  task: Task;
  sectionName?: string;
}> = ({ task, sectionName }) => {
  const viewMode = useViewModeStore(state => state.viewMode);
  return (
    <>
      {viewMode === ViewModes.STATUS && (<div className="card-current-section">{sectionName}</div>)}
      <div className="card-title">{task.taskName}</div>
      <div className="card-due-date">아 {formatKoreanDateSimple(task.start)} - {formatKoreanDateSimple(task.end)}</div>
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
          <AvatarGroup list={task.participants || []} maxVisible={2} />
        </div>
      </div>
      {task.todoList.length > 0 && (
        <>
          <div className="seperation-line" />
          <div className="card-todolist">
            <div className="card-todotoggle">
              <span>할 일</span>
              <span>▼</span>
            </div>
            {/* <div className="todolist-content">
                  <div className="todo-item"></div>
                </div> */}
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