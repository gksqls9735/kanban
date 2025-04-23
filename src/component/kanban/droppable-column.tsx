import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import CardWrapper from "./card-wrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Task } from "../../types/type";

const DroppableColumn: React.FC<{
  tasks: Task[];
  id: string;
  title: string;
  getSectionName: (sectionId: string) => string;
  colorMain?: string;
  colorSub?: string;
}> = ({ id, title, tasks, getSectionName, colorMain, colorSub }) => {



  const itemIds = tasks.map(item => item.taskId);

  const headerStyle: React.CSSProperties = {};
  if (colorMain && colorSub) {
    headerStyle.color = colorMain;
    headerStyle.border = `1px solid ${colorMain}`;
    headerStyle.backgroundColor = colorSub;
  }

  return (
    <div className="kanban-section">
      <div className="section-header" style={headerStyle}>{title}</div>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy} id={id}>
        <div className="section-content">
          {tasks.map(t => (
            <CardWrapper key={t.taskId} task={t} sectionName={getSectionName(t.sectionId)} />
          ))}
          <div className="task-add">
            <FontAwesomeIcon icon={faPlus} style={{ width: 13, height: 13 }} />
            <div>작업 추가</div>
          </div>
        </div>
      </SortableContext>
    </div>
  );
};

export default DroppableColumn;