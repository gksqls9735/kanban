import { Task } from "../../types/type";
import { lightenColor } from "../../utils/color-function";
import { formatKoreanDateSimple } from "../../utils/date-function";
import AvatarGroup from "../avatar/avatar-group";

const Card: React.FC<{
  task: Task;
  sectionName: string;
}> = ({ task, sectionName }) => {
  return (
    <div className="kanban-card">
      <div className="card-current-section">{sectionName}</div>
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
    </div>
  );
};

export default Card;