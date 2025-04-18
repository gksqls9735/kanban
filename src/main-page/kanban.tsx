import SectionComponent from "../component/kanban/section";
import { Section, Task } from "../types/type";

const Kanban: React.FC<{
  tasks: Task[];
  sections: Section[];
}> = ({ tasks, sections }) => {
  const list = [
    "이순신", "세종대왕", "장보고", "이성계"
  ];
  
  return (
    <div className='kanban'>
      <SectionComponent tasks={tasks}/>
    </div>
  );
};

export default Kanban;