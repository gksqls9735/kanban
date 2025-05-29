import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { SelectOption, Task } from "../../../types/type";
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
import { generateUniqueId } from "../../../utils/text-function";

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
  onOpenDetailModal?: (taskId: string) => void;
}> = ({ tasks, id, title, getSectionName, colorMain, colorSub, isOverlay, onAddBefore, onAddAfter, onOpenDetailModal }) => {
  const [isEdting, setIsEditing] = useState<boolean>(false);

  const viewMode = useViewModeStore(state => state.viewMode);
  const deleteTasksBySection = useTaskStore(state => state.deleteTasksBySection);
  const updateTasksByStatus = useTaskStore(state => state.updateTasksByStatus);
  const updateTasksWithNewStatusDetails = useTaskStore(state => state.updateTasksWithNewStatusDetails);
  const deleteStatus = useStatusesStore(state => state.deleteStatus);
  const deleteSection = useSectionsStore(state => state.deleteSection);
  const updateStatus = useStatusesStore(state => state.updateStatus);
  const updateSection = useSectionsStore(state => state.updateSection);
  const statusList = useStatusesStore(state => state.statusList);
  const sections = useSectionsStore(state => state.sections);

  const { showToast } = useToast();

  const [newCardList, setNewCardList] = useState<string[]>([]);
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

  const handleClose = (newCardId: string) => {
    const updatedNewCard = newCardList.filter(id => id !== newCardId);
    setNewCardList(updatedNewCard);
  };


  const handleUpdate = (name: string, color?: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast('이름을 입력해주세요.');
      return;
    }

    if (viewMode === ViewModes.STATUS && color) {
      const originalStatus = statusList.find(status => status.code === id);
      if (!originalStatus) {
        console.error("수정할 원본 상태를 찾을 수 없습니다. ID:", id);
        return;
      }

      // 시나리오 1: 입력된 이름이 원래 이름과 동일한 경우
      if (trimmedName === originalStatus.name) {
        // 이름은 같지만 색상이 변경되었는지 확인
        if (color !== originalStatus.colorMain) {
          const statusUpdates: Partial<SelectOption> = {
            // name: trimmedName, // 이름은 변경되지 않았으므로 생략 가능
            colorMain: color,
            colorSub: lightenColor(color, 0.85),
          };
          updateStatus(id, statusUpdates);

          // 연결된 작업들의 상태 정보도 업데이트
          const newStatusDetails: SelectOption = {
            ...originalStatus, // 기존 상태의 다른 정보는 유지
            colorMain: color,
            colorSub: lightenColor(color, 0.85),
          };
          updateTasksWithNewStatusDetails(newStatusDetails);
          showToast('상태 색상이 변경되었습니다.');
        } else {
          showToast('변경된 내용이 없습니다.');  // 문구 고민
        }
        setIsEditing(false);
        return;
      }

      const isDuplicateWithOthers = statusList.some(
        status => status.code !== id && status.name === trimmedName
      );

      if (isDuplicateWithOthers) {
        showToast('동일한 이름의 다른 상태가 이미 존재합니다.');
        return;
      }

      const statusUpdates: Partial<SelectOption> = {
        name: trimmedName,
        colorMain: color,
        colorSub: lightenColor(color, 0.85),
      };
      updateStatus(id, statusUpdates);

      const newStatusDataForTasks: SelectOption = {
        code: id,
        name: trimmedName,
        colorMain: color,
        colorSub: lightenColor(color, 0.85),
      };
      updateTasksWithNewStatusDetails(newStatusDataForTasks);
      showToast('상태 정보가 변경되었습니다.');

    } else if (viewMode === ViewModes.SECTION) {
      const originalSection = sections.find(sec => sec.sectionId === id);
      if (!originalSection) {
        console.error("수정할 원본 섹션을 찾을 수 없습니다. ID:", id);
        return;
      }

      if (trimmedName === originalSection.sectionName) {
        showToast('변경된 내용이 없습니다.');
        setIsEditing(false);
        return;
      }

      const isDuplicateWithOthers = sections.some(
        sec => sec.sectionId !== id && sec.sectionName === trimmedName
      );

      if (isDuplicateWithOthers) {
        showToast('동일한 이름의 다른 섹션이 이미 존재합니다.');
        return;
      }

      updateSection(id, { sectionName: trimmedName });
      showToast('섹션명이 변경되었습니다.');
    }
    setIsEditing(false);
  };

  const toggle = () => {
    setIsEditing(prev => !prev);
  };

  const handleAddNewTask = () => {
    const cardId = generateUniqueId('new-card');
    setNewCardList(prev => [...prev, cardId]);
  }

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
              <CardWrapper key={t.taskId} task={t} sectionName={getSectionName(t.sectionId)} onOpenDetailModal={onOpenDetailModal} />
            ))}
          </SortableContext>
          {newCardList.map(newCardId => (
            <NewTaskCard key={`new-card-${newCardId}`} columnId={id} onClose={handleClose} newCardId={newCardId} />
          ))}
          <div className="task-add" onClick={handleAddNewTask}>
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