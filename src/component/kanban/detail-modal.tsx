import { CSSProperties } from "styled-components";
import { Participant, Section, SelectOption, Task } from "../../types/type";
import { useMemo, useRef, useState } from "react";
import useSectionsStore from "../../store/sections-store";
import SectionSelector from "./new-card/section-selector";
import AvatarItem from "../avatar/avatar";
import { getInitial } from "../../utils/text-function";
import ParticipantSelector from "../participant-select/participant-selector";
import { formatToKoreanDateTimeString } from "../../utils/date-function";
import { priorityMedium, prioritySelect } from "../../mocks/select-option-mock";
import useStatusesStore from "../../store/statuses-store";
import OptionSelector from "./new-card/option-selector";
import { useImportanceSlider } from "../../hooks/use-importance-slider";

const DetailModal: React.FC<{
  task: Task;
  onClose: (e: React.MouseEvent) => void;
  openDeleteModal: (e: React.MouseEvent) => void;
}> = ({ task, onClose, openDeleteModal }) => {
  const sections = useSectionsStore(state => state.sections);
  const statusList = useStatusesStore(state => state.statusList);

  const [selectedSection, setSelectedSection] = useState<Section>(() => {
    return sections.find(sec => sec.sectionId === task.sectionId) || sections[0];
  });
  const [selectedPriority, setSelectedPriority] = useState<SelectOption>(task.priority || priorityMedium);
  const [selectedStatus, setSelectedStatus] = useState(() => {
    return statusList.find(status => status.code === task.status.code) || statusList[0];

  });

  const trackRef = useRef<HTMLDivElement>(null);
  const [currentImportance, setCurrentImportance] = useState<number>(task.importance || 0);
  const { onMouseDownHandler, isDragging } = useImportanceSlider({
    trackRef,
    value: currentImportance,
    onChange: setCurrentImportance,
    min: 0,
    max: 2,
    step: 0.5,
  });
  const handlerLeftPercent = (currentImportance / 2) * 100;

  const [isOpenParticipantModal, setIsOpenParticipantModal] = useState<boolean>(false);
  const [participants, setParticipants] = useState<Participant[]>(task.participants || []);
  const sortedParticipants = useMemo(() => {
    if (!participants || participants.length === 0) return [];
    return [...participants].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return 0;
    });
  }, [participants]);

  const handleSectionSelect = (section: Section) => setSelectedSection(section);
  const handleParticipants = (participants: Participant[]) => {
    setParticipants(participants);
  };
  const handleDeleteParticipants = (userId: string | number) => {
    setParticipants(prev =>
      prev.filter(u => u.id !== userId)
    );
  };

  const handlePrioritySelect = (priority: SelectOption) => setSelectedPriority(priority);
  const handleStatusSelect = (status: SelectOption) => setSelectedStatus(status);

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0000000A',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    zIndex: 1000,
    cursor: 'default'
  };

  const modalStyle: CSSProperties = {
    position: 'fixed',
    top: 80,
    bottom: 0,
    right: 0,
    width: 720,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    overflowY: 'auto',
    boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
  };

  const headerStyle: CSSProperties = {
    width: '100%',
    height: 56,
    padding: '0px 30px',
    borderBottom: '1px solid #EEF1F6',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const titleStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    padding: '24px 30px',
    borderBottom: '1px solid #EEF1F6',
  }

  const infoStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    padding: '24px 30px',
    borderBottom: '1px solid #EEF1F6',
  }

  return (
    <div style={overlayStyle} onClick={(e) => { e.stopPropagation(); onClose(e); }} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div className="header" style={headerStyle}>
          <div style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="#8D99A8" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x" id="X--Streamline-Feather" height="16" width="16">
              <desc>X Streamline Icon: https://streamlinehq.com</desc>
              <path d="M11.25 3.75 3.75 11.25" strokeWidth="1"></path>
              <path d="m3.75 3.75 7.5 7.5" strokeWidth="1"></path>
            </svg>
          </div>
          <div style={{ cursor: 'pointer' }} onClick={openDeleteModal}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
              <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
            </svg>
          </div>
        </div>
        <div className="title" style={titleStyle}>
          <SectionSelector selectedSection={selectedSection} onSectionSelect={handleSectionSelect} />
          <div style={{ fontSize: 18, color: '#0F1B2A', fontWeight: 600 }}>{task.taskName}</div>
          <div style={{ fontSize: 14, fontWeight: 400, color: '#5F6B7A' }}>작업 설명 {task.taskName}</div>
        </div>
        <div className="info" style={infoStyle}>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 80, fontSize: 13, fontWeight: 500, color: '#0F1B2A', flexShrink: 0 }}>보고자</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <AvatarItem
                size={24}
              >
                {getInitial(task.taskOwner.username)}
              </AvatarItem>
              <div style={{ fontSize: 13, fontWeight: 400, color: '#0F1B2A' }}>{task.taskOwner.username}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 80, fontSize: 13, fontWeight: 500, color: '#0F1B2A', flexShrink: 0 }}>담당자</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {sortedParticipants.map(u =>
                <div key={u.id} style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <AvatarItem size={24}>{getInitial(u.username)}</AvatarItem>
                  <div style={{ fontSize: 13, fontWeight: 400, color: '#0F1B2A' }}>{u.username}</div>
                  {u.isMain && (<div className="participant-main-badge">주</div>)}
                  <div onClick={() => handleDeleteParticipants(u.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', height: 24 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="#7D8998" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x" id="X--Streamline-Feather" height="16" width="16">
                      <desc>X Streamline Icon: https://streamlinehq.com</desc>
                      <path d="M11.25 3.75 3.75 11.25" strokeWidth="1"></path>
                      <path d="m3.75 3.75 7.5 7.5" strokeWidth="1"></path>
                    </svg>
                  </div>
                </div>
              )}
              <div onClick={() => setIsOpenParticipantModal(true)} style={{ cursor: 'pointer' }}>
                <AvatarItem
                  key="add"
                  isOverflow={true}
                  size={24}
                  isFirst={false}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#8D99A8" className="bi bi-plus-lg" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                  </svg>
                </AvatarItem>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center', height: 24 }}>
            <div style={{ width: 80, fontSize: 13, fontWeight: 500, color: '#0F1B2A', flexShrink: 0 }}>시작일</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#7d8998">
                  <path d="M360-300q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 400, color: '#0F1B2A' }}>{formatToKoreanDateTimeString(task.start)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center', height: 24 }}>
            <div style={{ width: 80, fontSize: 13, fontWeight: 500, color: '#0F1B2A', flexShrink: 0 }}>마감일</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#7d8998">
                  <path d="M360-300q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 400, color: '#0F1B2A' }}>{formatToKoreanDateTimeString(task.end)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 80, fontSize: 13, fontWeight: 500, color: '#0F1B2A', flexShrink: 0 }}>우선순위</div>
            <OptionSelector options={prioritySelect} selectedOption={selectedPriority} onSelect={handlePrioritySelect} />
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 80, fontSize: 13, fontWeight: 500, color: '#0F1B2A', flexShrink: 0 }}>상태</div>
            <OptionSelector options={statusList} selectedOption={selectedStatus} onSelect={handleStatusSelect} />
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ width: 80, fontSize: 13, fontWeight: 500, color: '#0F1B2A', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 13, position: 'relative', top: '-1px' }}>가중치</div>
                <div style={{ display: 'flex', alignItems: 'center', height: 16 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#1f1f1f">
                    <path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                </div>
              </div>
            </div>
            <div style={{ width: 228, height: 36, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', paddingTop: 7 }} >
              <div ref={trackRef} style={{ position: 'relative', width: '100%', height: 4, display: 'flex', alignItems: 'center' }}>
                <div style={{
                  height: 1, backgroundColor: '#E4E8EE',
                  position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', zIndex: 1
                }} />
                {['0%', '25%', '50%', '75%', '100%'].map((leftPosition, index) => (
                  <div key={index} style={{
                    width: 4, height: 4, backgroundColor: '#E4E8EE', borderRadius: '50%',
                    position: 'absolute', top: '50%', left: leftPosition, transform: 'translate(-50%, -50%)', zIndex: 2
                  }} />
                ))}
                <div
                  onMouseDown={onMouseDownHandler}
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    position: 'absolute', top: '50%', left: `${handlerLeftPercent}%`, transform: 'translate(-50%, -50%)', zIndex: 3,
                    backgroundColor: '#16B364', boxShadow: '0px 0px 0px 3px #AAF0C4',
                    cursor: `${isDragging ? 'grabbing' : 'grab'}`, userSelect: 'none',
                  }} />
              </div>
              <div style={{
                position: 'relative', width: '100%',
                fontSize: 11, fontWeight: 500, textAlign: 'center', verticalAlign: 'middle', color: '#7D8998', marginTop: 12
              }}>
                {[
                  { label: '0', left: '0%' },
                  { label: '0.5', left: '25%' },
                  { label: '1', left: '50%' },
                  { label: '1.5', left: '75%' },
                  { label: '2', left: '100%' }
                ].map((item, index) => (
                  <span key={`label-${index}`} style={{ position: 'absolute', left: item.left, transform: 'translateX(-50%)' }}>
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      {isOpenParticipantModal && (
        <ParticipantSelector
          initialParticipants={participants} onClose={() => setIsOpenParticipantModal(false)} onConfirm={handleParticipants}
        />)}
    </div>
  );
};

export default DetailModal;