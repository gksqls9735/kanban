import { SelectOption } from "../../../../types/type";
import { lightenColor } from "../../../../utils/color-function";
import { truncateText } from "../../../../utils/text-function";

const CardMeta: React.FC<{
  taskPriority: SelectOption;
  taskStatus: SelectOption;
}> = ({ taskPriority, taskStatus }) => {
  return (
    <div className="card-priority-status">
      <div className="card-priority-status-current truncate"
        style={{ color: taskPriority.colorMain, backgroundColor: taskPriority.colorSub || lightenColor(taskPriority.colorMain, 0.85) }}
      >
        {truncateText(taskPriority.name, 2)}</div>
      <div className="card-priority-status-current truncate"
        style={{ color: taskStatus.colorMain, backgroundColor: taskStatus.colorSub || lightenColor(taskStatus.colorMain, 0.85) }}
      >
        {truncateText(taskStatus.name, 2)}</div>
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