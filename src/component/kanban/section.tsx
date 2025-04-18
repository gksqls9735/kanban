import { statusSelect } from "../../mocks/select-option-mock";
import { Section, Task } from "../../types/type";
import Card from "./card";

const SectionComponent: React.FC<{
  tasks: Task[];
  isStatusView: boolean;
  sections: Section[];
}> = ({ tasks, isStatusView, sections }) => {
  const getSectionName = (sectionId: string) => {
    const id = sections.find(sec => sec.sectionId === sectionId)?.sectionName || '';
    return id;
  };
  
  return (
    <div className="kanban-content">
      {isStatusView ? (
        <>
          {statusSelect.map(status => (
            <div key={status.name} className="kanban-section">
              <div className="section-header">{status.name}</div>
              <div className="section-content">
                {tasks.filter(t => t.status.code === status.code).map(t => (
                  <Card key={t.taskId} task={t} sectionName={getSectionName(t.sectionId)}/>
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {sections.map(sec => (
            <div key={sec.sectionName} className="kanban-section">
              <div className="section-header">{sec.sectionName}</div>
              <div className="section-content">
                {tasks.filter(t => t.sectionId === sec.sectionId).map(t => (
                  <Card key={t.taskId} task={t} sectionName={sec.sectionName}/>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default SectionComponent;