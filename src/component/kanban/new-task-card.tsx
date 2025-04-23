import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { priorityMedium, prioritySelect } from "../../mocks/select-option-mock";
import { lightenColor } from "../../utils/color-function";
import useStatusesStore from "../../store/statuses-store";
import useSectionsStore from "../../store/sections-store";
import { useEffect, useRef } from "react";
import useViewModeStore from "../../store/viewmode-store";
import { ViewModes } from "../../constants";

const NewTaskCard: React.FC<{
  columnId: string;
}> = ({ columnId }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const statusList = useStatusesStore(state => state.statusList);
  const sections = useSectionsStore(state => state.sections);
  const viewMode = useViewModeStore(state => state.viewMode)

  const getSectionName = () => {
    if (viewMode === ViewModes.STATUS) {
      return sections[0].sectionName;
    } else {
      return sections.find(sec => sec.sectionId === columnId)?.sectionName;
    }
  };

  const getStatus = () => {
    if (viewMode === ViewModes.STATUS) {
      return statusList.find(sec => sec.code === columnId)!;
    } else {
      return statusList.filter(status => status.name === '대기')[0];
    }
  };

  const newStatus = getStatus();

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef.current]);

  return (
    <>
      <div className="kanban-card">
        <div className="card-current-section">
          {getSectionName()}
          <FontAwesomeIcon icon={faCaretDown} style={{ width: 12, height: 12 }} />
        </div>
        <input type="text"
          ref={inputRef}
          style={{ color: '#8D99A8', fontSize: 16, fontWeight: 500, lineHeight: '130%', border: 'none', outline: 'none' }}
          placeholder="작업명 입력" />
        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#7d8998" style={{ border: '1px solid #E4E8EE', borderRadius: 4, padding: 4 }}>
          <path d="M360-300q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
        </svg>
        <div className="card-meta">
          <div className="card-priority-status">
            <div className="card-priority"
              style={{ color: priorityMedium.colorMain, backgroundColor: priorityMedium.colorSub || lightenColor(priorityMedium.colorMain, 0.85) }}
            >
              {priorityMedium.name}
              <FontAwesomeIcon icon={faCaretDown} style={{ width: 12, height: 12, marginLeft: 2 }} />
            </div>
            <div className="card-status"
              style={{ color: newStatus.colorMain, backgroundColor: newStatus.colorSub || lightenColor(newStatus.colorMain, 0.85) }}
            >
              {newStatus.name}
              <FontAwesomeIcon icon={faCaretDown} style={{ width: 12, height: 12, marginLeft: 2 }} />
            </div>
          </div>
        </div>
        <div style={{
          width: 80, padding: '8px 0px', display: 'flex', flexDirection: 'column', border: '1px solid #E4E8EE', borderRadius: 4,
          boxShadow: '0px 0px 16px 0px #00000014'
        }}>
          {prioritySelect.map(p => (
            <div key={p.code} style={{ color: p.colorMain, fontSize: 13, height: 36, lineHeight: '36px', padding: '0px 12px' }}>{p.name}</div>
          ))}
        </div>
        <div style={{
          width: 80, padding: '8px 0px', display: 'flex', flexDirection: 'column', border: '1px solid #E4E8EE', borderRadius: 4,
          boxShadow: '0px 0px 16px 0px #00000014'
        }}>
          {statusList.map(s => (
            <div key={s.code} style={{ color: s.colorMain, fontSize: 13, height: 36, lineHeight: '36px', padding: '0px 12px' }}>{s.name}</div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NewTaskCard;