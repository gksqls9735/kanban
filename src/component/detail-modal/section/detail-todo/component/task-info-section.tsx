import { useMemo, useState } from "react";
import useStatusesStore from "../../../../../store/statuses-store";
import { Participant, SelectOption, Task, User } from "../../../../../types/type";
import { prioritySelect } from "../../../../../mocks/select-option-mock";
import ReporterField from "../../info-field/reporter-field";
import ParticipantsField from "../../info-field/participants-field";
import DateField from "../../info-field/date-field";
import OptionSelector from "../../../../common/selector/option-selector";
import ImportanceField from "../../info-field/importance-field";
import ParticipantSelector from "../../../../participant-select/participant-selector";

const TaskInfoSection: React.FC<{
  task: Task;
  currentUser: User;
  isOwnerOrParticipant: boolean;
  onUpdate: (updates: Partial<Task>) => void;
  onOpenProfile: (e: React.MouseEvent, user: Participant | User | null) => void;
}> = ({ task, currentUser, isOwnerOrParticipant, onUpdate, onOpenProfile }) => {
  const statusList = useStatusesStore(state => state.statusList);
  const [isOpenParticipantModal, setIsOpenParticipantModal] = useState<boolean>(false);

  const derivedSelectedPriority = useMemo(() => prioritySelect.find(p => p.code === task.priority.code) || task.priority, [task.priority]);
  const derivedSelectedStatus = useMemo(() => statusList.find(s => s.code === task.status.code) || task.status, [statusList, task.status]);
  const sortedParticipants = useMemo(() => [...task.participants].sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    return 0;
  }), [task.participants]);

  const handleParticipantsUpdate = (newParticipants: Participant[]) => onUpdate({ participants: newParticipants });
  const handleDeleteParticipant = (userId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ participants: task.participants.filter(u => u.id !== userId) });
  };
  const handlePriorityChange = (priority: SelectOption) => onUpdate({ priority: priority });
  const handleStatusChange = (status: SelectOption) => onUpdate({ status: status });
  const handleImportanceValueChange = (newImportance: number) => onUpdate({ importance: newImportance });

  return (
    <>
      <div className="task-detail__detail-modal-section">
        <ReporterField userIcon={currentUser!.icon} userName={currentUser!.username} onClick={(e) => onOpenProfile(e, currentUser!)} />

        <ParticipantsField
          participants={sortedParticipants}
          onDeleteParticipant={handleDeleteParticipant}
          onAddParticipantClick={() => setIsOpenParticipantModal(true)}
          isOwnerOrParticipant={isOwnerOrParticipant}
          onClick={onOpenProfile}
        />

        <DateField label="시작일" date={task.start} />
        <DateField label="마감일" date={task.end} />

        <div className="task-detail__detail-modal-info-row">
          <div className="task-detail__detail-modal-info-value--select-option">우선순위</div>
          <OptionSelector options={prioritySelect} selectedOption={derivedSelectedPriority} onSelect={handlePriorityChange} isOwnerOrParticipant={isOwnerOrParticipant} />
        </div>

        <div className="task-detail__detail-modal-info-row">
          <div className="task-detail__detail-modal-info-value--select-option">상태</div>
          <OptionSelector options={statusList} selectedOption={derivedSelectedStatus} onSelect={handleStatusChange} isOwnerOrParticipant={isOwnerOrParticipant} />
        </div>

        <ImportanceField initialValue={task.importance} onChange={handleImportanceValueChange} isOwnerOrParticipant={isOwnerOrParticipant} />

      </div>
      {isOpenParticipantModal && (
        <ParticipantSelector
          initialParticipants={task.participants}
          onClose={() => setIsOpenParticipantModal(false)}
          onConfirm={handleParticipantsUpdate}
        />
      )}
    </>
  );
};

export default TaskInfoSection;