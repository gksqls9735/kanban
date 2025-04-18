import { useState } from "react";
import SectionComponent from "../component/kanban/section";
import { Section, Task } from "../types/type";

const Kanban: React.FC<{
  tasks: Task[];
  sections: Section[];
}> = ({ tasks, sections }) => {
  const [isStatusView, setIsStatusView] = useState<boolean>(true);

  return (
    <>
      <div className='kanban'>
        <div onClick={() => setIsStatusView(prev => !prev)}>{isStatusView ? '섹션별로 보기' : '상태별로 보기'} </div>
        <SectionComponent tasks={tasks} isStatusView={isStatusView} sections={sections}/>
      </div>
    </>
  );
};

export default Kanban;