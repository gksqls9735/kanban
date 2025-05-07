import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Task } from "../../../types/type";
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from "react";
import NewTaskCard from "../new-card/new-task-card";
import CardWrapper from "../card/card-wrapper";
import DeleteModal from "../delete-modal";
import useViewModeStore from "../../../store/viewmode-store";
import { ViewModes } from "../../../constants";
import useTaskStore from "../../../store/task-store";
import useStatusesStore from "../../../store/statuses-store";
import useSectionsStore from "../../../store/sections-store";
import ColumnHeader from "./column-header";
import ColumnEdit from "./column-edit";
import { lightenColor } from "../../../utils/color-function";
import { useToast } from "../../../context/toast-context";

const DroppableColumn: React.FC<{
  tasks: Task[];
  id: string;
  title: string;
  getSectionName: (sectionId: string) => string;
  colorMain?: string;
  colorSub?: string;
  isOverlay?: boolean;
  onAddBefore?: (targetSectionId: string) => void;
  onAddAfter?: (targetSectionId: string) => void;
}> = ({ tasks, id, title, getSectionName, colorMain, colorSub, isOverlay, onAddBefore, onAddAfter }) => {
  const [isEdting, setIsEditing] = useState<boolean>(false);

  const viewMode = useViewModeStore(state => state.viewMode);
  const deleteTasksBySection = useTaskStore(state => state.deleteTasksBySection);
  const updateTasksByStatus = useTaskStore(state => state.updateTasksByStatus);
  const deleteStatus = useStatusesStore(state => state.deleteStatus);
  const deleteSection = useSectionsStore(state => state.deleteSection);
  const updateSection = useSectionsStore(state => state.updateSection);
  const updateStatus = useStatusesStore(state => state.updateStatus);
  const { showToast } = useToast();


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
    headerStyle.cursor = isOverlay ? 'grabbing' : 'grab';
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
    deleteSection(id);
    deleteTasksBySection(id);
    setIsDeleteModalOpen(false);
    showToast(`섹션 ${title}이/가 성공적으로 삭제되었습니다.`)
  }

  const handleDeleteStatus = () => {
    deleteStatus(id);
    updateTasksByStatus(id);
    setIsDeleteModalOpen(false);
    showToast(`상태 ${title}이/가 성공적으로 삭제되었습니다.`)
  };

  const handleClose = () => {
    setIsAddingTask(false);
  };

  const handleUpdate = (name: string, color?: string) => {
    if (name) {
      if (viewMode === ViewModes.STATUS && color) {
        if (color === colorMain) {
          updateStatus(id, { name: name })
        } else {
          updateStatus(id, { name: name, colorMain: color, colorSub: lightenColor(color, 0.85) })
        }
      } else if (viewMode === ViewModes.SECTION) {
        updateSection(id, { sectionName: name })
      }
      setIsEditing(false);
    }
  };

  const toggle = () => {
    setIsEditing(prev => !prev);
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
          <ColumnHeader
            columnId={id} columnTitle={title} deleteActionLabel={deleteActionLabel}
            onDelete={() => setIsDeleteModalOpen(true)} handleEditClick={() => setIsEditing(true)}
            onAddBefore={onAddBefore} onAddAfter={onAddAfter}
          />
        </div>
        {isEdting && (
          <ColumnEdit
            viewMode={viewMode} isEdting={isEdting} toggle={toggle} onUpdate={handleUpdate} colorMain={colorMain} columnTitle={title} />
        )}
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