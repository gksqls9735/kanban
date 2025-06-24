import { Section } from "../../../types/type";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import useDropdown from "../../../hooks/use-dropdown";
import { truncateText } from "../../../utils/text-function";
import useSectionsStore from "../../../store/sections-store";

const SectionSelector: React.FC<{
  selectedSection: Section;
  onSectionSelect: (section: Section) => void;
  isOwnerOrParticipant?: boolean;
}> = ({ selectedSection, onSectionSelect, isOwnerOrParticipant = false }) => {
  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
  const sections = useSectionsStore(state => state.sections);

  const handleSelect = (section: Section) => {
    onSectionSelect(section);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {isOwnerOrParticipant ? (
        <>
          <div ref={wrapperRef} className="card-current-section update-card-current-section" onClick={toggle} style={{cursor: 'pointer'}}>
            {truncateText(selectedSection.sectionName, 10)}
            <FontAwesomeIcon icon={faCaretDown} style={{ width: 12, height: 12 }} />
          </div>
          {isOpen && (
            <div ref={dropdownRef} className="select-dropdown-panel section-dropdown-panel">
              {sections.map(sec => (
                <div key={sec.sectionId} className="select-dropdown-item section-dropdown-item truncate" onClick={() => handleSelect(sec)}>
                  {sec.sectionName}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="card-current-section">{truncateText(selectedSection.sectionName, 10)}</div>
      )}

    </div>
  );
};

export default SectionSelector;