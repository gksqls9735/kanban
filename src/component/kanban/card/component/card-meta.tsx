import { Task } from "../../../../types/type";
import { lightenColor } from "../../../../utils/color-function";
import { truncateText } from "../../../../utils/text-function";

const CardMeta: React.FC<{
  task: Task;
}> = ({ task }) => {
  return (
    <div className="card-priority-status">
      <div className="card-priority truncate"
        style={{ color: task.priority.colorMain, backgroundColor: task.priority.colorSub || lightenColor(task.priority.colorMain, 0.85) }}
      >
        {truncateText(task.priority.name, 2)}</div>
      <div className="card-status truncate"
        style={{ color: task.status.colorMain, backgroundColor: task.status.colorSub || lightenColor(task.status.colorMain, 0.85) }}
      >
        {truncateText(task.status.name, 2)}</div>
    </div>
  );
};

// const areMetaPropsEqual = (prevProps: any, nextProps: any) => {
//   const prevTask = prevProps.task;
//   const nextTask = nextProps.task;

//   if (
//     prevTask.priority.code !== nextTask.priority.code ||
//     prevTask.priority.name !== nextTask.priority.name ||
//     prevTask.priority.colorMain !== nextTask.priority.colorMain ||
//     prevTask.priority.colorSub !== nextTask.priority.colorSub
//   ) {
//     return false;
//   }

//   if (
//     prevTask.status.code !== nextTask.status.code ||
//     prevTask.status.name !== nextTask.status.name ||
//     prevTask.status.colorMain !== nextTask.status.colorMain ||
//     prevTask.status.colorSub !== nextTask.status.colorSub
//   ) {
//     return false;
//   }

//   return true;
// };


export default CardMeta;