import { Task } from "../../types/type";
import Card from "./card";

const SectionComponent: React.FC<{
  tasks: Task[];
}> = ({ tasks }) => {
  return (
    <div className="kanban-section">
      <div className="section-header">진행</div>
      <div className="section-content">
        {tasks.map(t => (
          <Card task={t}/>
        ))}
      </div>
    </div>
  );
};

export default SectionComponent;