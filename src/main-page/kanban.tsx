import AvatarGroup from "../component/avatar/avatar-group";
import { priorityUrgent, statusInProgress } from "../mocks/select-option.-mock";
import { Section, Task } from "../types/type";
import { lightenColor } from "../utils/color-function";

const Kanban: React.FC<{
  tasks: Task[];
  sections: Section[];
}> = ({ tasks, sections }) => {
  const list = [
    "이순신", "세종대왕", "장보고", "이성계"
  ];

  return (
    <div className='kanban'>

    </div>
  );
};

export default Kanban;