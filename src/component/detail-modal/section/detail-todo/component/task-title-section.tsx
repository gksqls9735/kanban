import { useMemo } from "react";
import useSectionsStore from "../../../../../store/sections-store";
import { Section } from "../../../../../types/type";
import SectionSelector from "../../../../common/selector/section-selector";

const TaskTitleSection: React.FC<{
  taskName: string;
  memo: string;
  sectionId: string;
  isOwnerOrParticipant: boolean;
  onUpdate: (updates: { sectionId: string }) => void;
}> = ({ taskName, memo, sectionId, isOwnerOrParticipant, onUpdate }) => {
  const sections = useSectionsStore(state => state.sections);

  const derivedSelectedSection = useMemo(() => {
    return sections.find(sec => sec.sectionId === sectionId) || sections[0];
  }, [sections, sectionId]);

  const handleSectionChange = (section: Section) => onUpdate({ sectionId: section.sectionId });

  return (
    <div className="task-detail__detail-modal-section">
      <SectionSelector selectedSection={derivedSelectedSection} onSectionSelect={handleSectionChange} isOwnerOrParticipant={isOwnerOrParticipant} />
      <div className="task-detail__detail-modal-title-info-name">{taskName}</div>
      <div className="task-detail__detail-modal-title-info-name-description">{memo}</div>
    </div>
  );
};

export default TaskTitleSection;