import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { priorityMedium, prioritySelect } from "../../mocks/select-option-mock";
import { lightenColor } from "../../utils/color-function";
import useStatusesStore from "../../store/statuses-store";
import useSectionsStore from "../../store/sections-store";
import { useEffect, useRef, useState } from "react";
import useViewModeStore from "../../store/viewmode-store";
import { ViewModes } from "../../constants";
import { Section, SelectOption } from "../../types/type";
import AvatarGroup from "../avatar/avatar-group";
import DateTimePicker from "./datetime-picker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const NewTaskCard: React.FC<{
  columnId: string;
}> = ({ columnId }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const statusList = useStatusesStore(state => state.statusList);
  const sections = useSectionsStore(state => state.sections);
  const viewMode = useViewModeStore(state => state.viewMode);

  const [openDropdown, setOpenDropdown] = useState<'date' | 'section' | 'priority' | 'status' | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section>(() => {
    if (viewMode === ViewModes.STATUS) {
      return sections[0];
    } else {
      return sections.find(sec => sec.sectionId === columnId) || sections[0];
    }
  });
  const [selectedPriority, setSelectedPriority] = useState<SelectOption>(priorityMedium);
  const [selectedStatus, setSelectedStatus] = useState(() => {
    if (viewMode === ViewModes.STATUS) {
      return statusList.find(sec => sec.code === columnId) || statusList[0];
    } else {
      return statusList.find(status => status.name === '대기') || statusList[0];
    }
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerDropdownRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const sectionDropdownRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef.current]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const path = e.composedPath();
      if (openDropdown === 'date') {
        const isClickInsideDatePicker =
          (pickerRef.current && path.includes(pickerRef.current)) ||
          (pickerDropdownRef.current && path.includes(pickerDropdownRef.current));
        if (!isClickInsideDatePicker) setOpenDropdown(null);
      } else if (openDropdown === 'section') {
        const isClickInsideSection =
          (sectionRef.current && path.includes(sectionRef.current)) ||
          (sectionDropdownRef.current && path.includes(sectionDropdownRef.current));
        if (!isClickInsideSection) setOpenDropdown(null);
      } else if (openDropdown === 'priority') {
        const isClickInsidePriority =
          (priorityRef.current && path.includes(priorityRef.current)) ||
          (priorityDropdownRef.current && path.includes(priorityDropdownRef.current));
        if (!isClickInsidePriority) setOpenDropdown(null);
      } else if (openDropdown === 'status') {
        const isClickInsideStatus =
          (statusRef.current && path.includes(statusRef.current)) ||
          (statusDropdownRef.current && path.includes(statusDropdownRef.current));
        if (!isClickInsideStatus) setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const handlePickerClick = () => {
    setOpenDropdown(openDropdown === 'date' ? null : 'date');
  };

  const handleSectionClick = () => {
    setOpenDropdown(openDropdown === 'section' ? null : 'section');
  };

  const handlePriorityClick = () => {
    setOpenDropdown(openDropdown === 'priority' ? null : 'priority');
  };

  const handleStatusClick = () => {
    setOpenDropdown(openDropdown === 'status' ? null : 'status');
  };

  const handleDateSelect = (start: Date | null, end: Date | null) => {
    console.log("Start Date: ", start);
    console.log("End Date: ", end);
    setStartDate(start);
    setEndDate(end);
  };

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section);
    setOpenDropdown(null);
  };

  const handlePrioritySelect = (priority: SelectOption) => {
    setSelectedPriority(priority);
    setOpenDropdown(null);
  };

  const handleStatusSelect = (status: SelectOption) => {
    setSelectedStatus(status);
    setOpenDropdown(null);
  };

  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return '날짜 선택';
    return format(date, 'yyyy.MM.dd', { locale: ko }); // 예: 03.15
  };

  return (
    <>
      <div className="kanban-card" style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <div
            ref={sectionRef}
            className="card-current-section"
            style={{ cursor: 'pointer' }}
            onClick={handleSectionClick}
          >
            {selectedSection.sectionName}
            <FontAwesomeIcon icon={faCaretDown} style={{ width: 12, height: 12 }} />
          </div>
          {openDropdown === 'section' && (
            <div
              ref={sectionDropdownRef}
              style={{
                position: 'absolute', top: `calc(100%)`, left: 4,
                width: 120, padding: '8px 0px', display: 'flex', flexDirection: 'column', border: '1px solid #E4E8EE', borderRadius: 4,
                backgroundColor: '#fff', boxShadow: '0px 0px 16px 0px #00000014', zIndex: 10
              }}
            >
              {sections.map(sec => (
                <div
                  key={sec.sectionId}
                  style={{ color: '#0F1B2A', fontSize: 13, height: 36, lineHeight: '36px', padding: '0px 12px', cursor: 'pointer' }}
                  onClick={() => handleSectionSelect(sec)}
                >
                  {sec.sectionName}
                </div>
              ))}
            </div>
          )}
        </div>
        <input type="text"
          ref={inputRef}
          style={{ color: '#8D99A8', fontSize: 16, fontWeight: 500, lineHeight: '130%', border: 'none', outline: 'none' }}
          placeholder="작업명 입력" />
        <div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              ref={pickerRef}
              onClick={handlePickerClick}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E4E8EE', borderRadius: 4, padding: '4px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#7d8998">
                  <path d="M360-300q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
                </svg>
              </div>
              <span style={{fontSize: 13, color: startDate ? '#333' : '#7d8998'}}>
                {startDate && endDate && startDate.getTime() !== endDate.getTime()
                  ? `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`
                  : formatDateDisplay(startDate)}
              </span>
            </div>
            {openDropdown === 'date' && (
              <div
                ref={pickerDropdownRef}
                style={{
                  position: 'absolute',
                  top: 'calc(100%)',
                  left: 4,
                  zIndex: 10,
                }}
              >
                <DateTimePicker onChange={handleDateSelect} />
              </div>
            )}
          </div>

        </div>
        <div className="card-meta">
          <div className="card-priority-status" style={{ display: 'flex', gap: '8px', position: 'relative' }}>
            <div style={{ position: 'relative', padding: '0px' }}>
              <div
                ref={priorityRef}
                className="card-priority"
                style={{ color: selectedPriority.colorMain, backgroundColor: selectedPriority.colorSub || lightenColor(selectedPriority.colorMain, 0.85), cursor: 'pointer' }}
                onClick={handlePriorityClick}
              >
                {selectedPriority.name}
                <FontAwesomeIcon icon={faCaretDown} style={{ width: 12, height: 12, marginLeft: 2 }} />
              </div>
              {openDropdown === 'priority' && (
                <div
                  ref={priorityDropdownRef}
                  style={{
                    position: 'absolute', top: 'calc(100%)', left: 4,
                    width: 80, padding: '8px 0px', display: 'flex', flexDirection: 'column', border: '1px solid #E4E8EE', borderRadius: 4,
                    boxShadow: '0px 0px 16px 0px #00000014', zIndex: 10,
                  }}>
                  {prioritySelect.map(p => (
                    <div
                      key={p.code}
                      style={{
                        color: p.colorMain, fontSize: 13, height: 36, lineHeight: '36px', padding: '0px 12px', cursor: 'pointer',
                        backgroundColor: selectedPriority.code === p.code ? (p.colorSub || lightenColor(p.colorMain, 0.85)) : '#fff',
                      }}
                      onClick={() => handlePrioritySelect(p)}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ position: 'relative', padding: '0px' }}>
              <div
                ref={statusRef}
                className="card-status"
                style={{ color: selectedStatus.colorMain, backgroundColor: selectedStatus.colorSub || lightenColor(selectedStatus.colorMain, 0.85), cursor: 'pointer' }}
                onClick={handleStatusClick}
              >
                {selectedStatus.name}
                <FontAwesomeIcon icon={faCaretDown} style={{ width: 12, height: 12, marginLeft: 2 }} />
              </div>
              {openDropdown === 'status' && (
                <div
                  ref={statusDropdownRef}
                  style={{
                    position: 'absolute', top: 'calc(100%)', left: 4,
                    width: 80, padding: '8px 0px', display: 'flex', flexDirection: 'column', border: '1px solid #E4E8EE', borderRadius: 4,
                    boxShadow: '0px 0px 16px 0px #00000014', zIndex: 10,
                  }}>
                  {statusList.map(s => (
                    <div
                      key={s.code}
                      style={{
                        color: s.colorMain, fontSize: 13, height: 36, lineHeight: '36px', padding: '0px 12px', cursor: 'pointer',
                        backgroundColor: selectedStatus.code === s.code ? (s.colorSub || lightenColor(s.colorMain, 0.85)) : '#fff',
                      }}
                      onClick={() => handleStatusSelect(s)}
                    >
                      {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <AvatarGroup list={[]} maxVisible={0} />
        </div>
        <div className="seperation-line" />
        <div style={{ color: '#7D8998', display: 'flex', gap: 6, alignItems: 'center' }}>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="#7D8998" className="bi bi-plus-lg" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
            </svg>
          </div>
          <div style={{ fontWeight: 400, fontSize: 13, lineHeight: '16px', letterSpacing: '0%' }}>
            할 일 추가
          </div>
        </div>
      </div>
    </>
  );
};

export default NewTaskCard;