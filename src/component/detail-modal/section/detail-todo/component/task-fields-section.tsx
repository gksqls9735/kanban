import { useMemo, useState } from "react";
import { Participant, Task, User } from "../../../../../types/type";
import UrlField from "../../field/url-field";
import MultiSelection from "../../field/multi-selection-field";
import AttachmentField from "../../field/attachment-field";
import SingleSelection from "../../field/single-selection";
import TextField from "../../field/text-field";
import NumericFieldComponent from "../../field/numeric-field";
import IdField from "../../field/id-field";
import EmailField from "../../field/email-field";
import UserField from "../../field/user-field";

const TaskFieldsSection: React.FC<{
  task: Task;
  isOwnerOrParticipant: boolean;
  onUpdate: (updates: Partial<Task>) => void;
  onOpenProfile: (e: React.MouseEvent, user: Participant | User | null) => void;
}> = ({ task, isOwnerOrParticipant, onUpdate, onOpenProfile }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const visibleFieldComponents = useMemo(() => {
    const allFields = [
      <UrlField key="url" urls={task.urls} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={onUpdate} />,
      <MultiSelection key="multi" options={task.multiSelection} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={onUpdate} />,
      <AttachmentField key="attach" taskId={task.taskId} attachments={task.taskAttachments} isOwnerOrParticipant={isOwnerOrParticipant}/>,
      <SingleSelection key="single" options={task.singleSelection} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={onUpdate} />,
      <TextField key="text" text={task.memo} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={onUpdate} />,
      <NumericFieldComponent key="num" numericField={task.numericField} taskId={task.taskId} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={onUpdate} />,
      <IdField key="id" prefix={task.prefix} taskId={task.taskId} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={onUpdate} />,
      <EmailField key="email" emails={task.emails} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={onUpdate} />,
      <UserField key="user" users={task.participants} isOwnerOrParticipant={isOwnerOrParticipant} handleChangeAndNotify={onUpdate} onClick={onOpenProfile} />,
    ].filter(Boolean);
    return isExpanded ? allFields : allFields.slice(0, 3);
  }, [task, isExpanded, isOwnerOrParticipant, onOpenProfile]);

  return (
    <div className="task-detail__detail-modal-section task-detail__detail-modal-section--field">
      <div className="task-detail__detail-modal-section--field-title">필드</div>
      <ul className="task-detail__detail-modal-field-list">
        {visibleFieldComponents.map((field, idx) => (
          <div key={idx}>{field}</div>
        ))}
        <li className="task-detail__detail-modal-field-item">
          <span onClick={() => setIsExpanded(prev => !prev)} className="task-detail__detail-modal-field-expand-text">
            {isExpanded ? (<>필드 접기</>) : (<>필드 더보기...</>)}
          </span>
        </li>
      </ul>
    </div>
  );
};

export default TaskFieldsSection;