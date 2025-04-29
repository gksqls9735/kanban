import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Task } from "../../types/type";
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from "react";
import NewTaskCard from "./new-card/new-task-card";
import CardWrapper from "./card/card-wrapper";
import useDropdown from "../../hooks/use-dropdown";
import DeleteModal from "./delete-modal";
import useViewModeStore from "../../store/viewmode-store";
import { ViewModes } from "../../constants";
import useTaskStore from "../../store/task-store";
import useStatusesStore from "../../store/statuses-store";
import useSectionsStore from "../../store/sections-store";

const DroppableColumn: React.FC<{
  tasks: Task[];
  id: string;
  title: string;
  getSectionName: (sectionId: string) => string;
  colorMain?: string;
  colorSub?: string;
  isOverlay?: boolean;
}> = ({ tasks, id, title, getSectionName, colorMain, colorSub, isOverlay }) => {
  const { isOpen, setIsOpen, wrapperRef, dropdownRef, toggle } = useDropdown();

  const viewMode = useViewModeStore(state => state.viewMode);
  const deleteTasksBySection = useTaskStore(state => state.deleteTasksBySection);
  const updateTasksByStatus = useTaskStore(state => state.updateTasksByStatus);
  const deleteStatus = useStatusesStore(state => state.deleteStatus);
  const deleteSection = useSectionsStore(state => state.deleteSection);

  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging
  } = useSortable({ id: id, data: { type: 'Column', columnId: id } });

  const tasksId = tasks.map(item => item.taskId);

  const headerStyle: React.CSSProperties = {};
  if (colorMain && colorSub) {
    headerStyle.color = colorMain;
    headerStyle.border = `1px solid ${colorMain}`;
    headerStyle.backgroundColor = colorSub;
    headerStyle.cursor = isOverlay ? 'grabbing' : 'grab';
  } else {
    headerStyle.color = '#5F6B7A';
    headerStyle.fontWeight = 600;
  }

  const columnStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    flexShrink: 0,
  };

  const handleDeleteSection = () => {
    console.log("section 제거: ", id);
    deleteSection(id);
    deleteTasksBySection(id);
    setIsDeleteModalOpen(false);
    setIsOpen(false);
  }

  const handleDeleteStatus = () => {
    console.log("status 제거: ", id);
    deleteStatus(id);
    updateTasksByStatus(id);
    setIsDeleteModalOpen(false);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsAddingTask(false);
  };

  const deleteActionLabel = useMemo(() => viewMode === ViewModes.STATUS ? '상태 삭제' : '섹션 삭제', [viewMode]);
  const deleteModalTitle = useMemo(() => viewMode === ViewModes.STATUS ? '상태를 삭제 하시겠습니까?' : '섹션을 삭제 하시겠습니까?', [viewMode]);
  const deleteModalMsg = useMemo(() =>
    viewMode === ViewModes.STATUS
      ? "상태에 포함된 작업의 진행상태는 '대기'로 변경 됩니다."
      : '이 섹션에 포함된 모든 작업 내역이 삭제되며,<br /> 복구할 수 없습니다.'
    , [viewMode]);
  const handleDelete = useMemo(() => viewMode === ViewModes.STATUS ? handleDeleteStatus : handleDeleteSection, [viewMode]);

  return (
    <>
      <div ref={setNodeRef} style={columnStyle} {...attributes} className="kanban-section">
        <div className="section-header" style={headerStyle} {...listeners}>
          <span className="section-header__title">{title}</span>
          <div className="section-header__actions">
            <div className="section-header__action">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#8D99A8" style={{ padding: 5 }}>
                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
              </svg>
            </div>
            <div ref={wrapperRef} className="section-header__action" onClick={toggle}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#8D99A8" style={{ padding: 5 }}>
                <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
              </svg>
            </div>
          </div>
          {isOpen && (
            <div ref={dropdownRef} className="header-dropdown-menu section-header__dropdown-menu">
              <div className="header-dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" id="Column-Insert-Left--Streamline-Tabler" height="16" width="16">
                  <desc>Column Insert Left Streamline Icon: https://streamlinehq.com</desc>
                  <path d="M8.75 2.5h2.5a0.625 0.625 0 0 1 0.625 0.625v8.75a0.625 0.625 0 0 1 -0.625 0.625h-2.5a0.625 0.625 0 0 1 -0.625 -0.625V3.125a0.625 0.625 0 0 1 0.625 -0.625z" strokeWidth="1"></path>
                  <path d="m3.125 7.5 2.5 0" strokeWidth="1"></path><path d="m4.375 6.25 0 2.5" strokeWidth="1"></path>
                </svg>
                왼쪽에 섹션추가</div>
              <div className="header-dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 16 16" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" id="Column-Insert-Right--Streamline-Tabler" height="16" width="16"><desc>Column Insert Right Streamline Icon: https://streamlinehq.com</desc>
                  <path d="M3.75 2.5h2.5a0.625 0.625 0 0 1 0.625 0.625v8.75a0.625 0.625 0 0 1 -0.625 0.625H3.75a0.625 0.625 0 0 1 -0.625 -0.625V3.125a0.625 0.625 0 0 1 0.625 -0.625z" strokeWidth="1"></path>
                  <path d="m9.375 7.5 2.5 0" strokeWidth="1"></path><path d="m10.625 6.25 0 2.5" strokeWidth="1"></path>
                </svg>
                오른쪽에 섹션추가</div>
              <div className="header-dropdown-item" onClick={() => setIsDeleteModalOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                </svg>
                {deleteActionLabel}
              </div>
            </div>
          )}
        </div>
        <div className="section-content">
          <SortableContext items={tasksId} strategy={verticalListSortingStrategy}>
            {tasks.map(t => (
              <CardWrapper key={t.taskId} task={t} sectionName={getSectionName(t.sectionId)} />
            ))}
          </SortableContext>
          {isAddingTask && (<NewTaskCard columnId={id} onClose={handleClose} />)}
          <div className="task-add" onClick={() => setIsAddingTask(true)}>
            <FontAwesomeIcon icon={faPlus} style={{ width: 13, height: 13 }} />
            <div>작업 추가</div>
          </div>
        </div>
      </div>
      {isDeleteModalOpen && (
        <DeleteModal
          title={deleteModalTitle}
          message={deleteModalMsg}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

export default DroppableColumn;