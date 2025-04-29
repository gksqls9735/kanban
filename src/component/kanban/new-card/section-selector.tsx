import { Section } from "../../../types/type";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import useDropdown from "../../../hooks/use-dropdown";
import { truncateText } from "../../../utils/text-function";

const SectionSelector: React.FC<{
  sections: Section[];
  selectedSection: Section;
  onSectionSelect: (section: Section) => void;
}> = ({ sections, selectedSection, onSectionSelect }) => {
  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();

  const handleSelect = (section: Section) => {
    onSectionSelect(section);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div ref={wrapperRef} className="card-current-section" onClick={toggle}>
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
    </div>
  );
};

export default SectionSelector;