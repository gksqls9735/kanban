import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { SelectOption, Task } from "../../../types/type";
import React, { useMemo, useState } from "react";
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
  columnId: string;
  title: string;
  getSectionName: (sectionId: string) => string;
  colorMain?: string;
  colorSub?: string;
  isOverlay?: boolean;
  onAddBefore?: (targetColumnId: string) => void;
  onAddAfter?: (targetColumnId: string) => void;
  onOpenDetailModal?: (taskId: string) => void;

  placeholderData: { columnId: string; index: number } | null;
}> = ({
  tasks,
  columnId,
  title,
  getSectionName,
  colorMain,
  colorSub,
  isOverlay,
  onAddBefore,
  onAddAfter,
  onOpenDetailModal,
  placeholderData,
}) => {
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

    const tasksId = tasks.map(item => item.taskId);

    const currentHeaderStyle: React.CSSProperties = useMemo(() => {
      const style: React.CSSProperties = {};
      if (colorMain && colorSub) {
        style.color = colorMain;
        style.border = `1px solid ${colorMain}`;
        style.backgroundColor = colorSub;
      } else {
        style.color = '#5F6B7A';
      }
      style.cursor = isOverlay ? 'grabbing' : 'grab';
      style.marginBottom = isOverlay ? 16 : 0;
      return style;
    }, [colorMain, colorSub, isOverlay]);

    const handleDeleteSection = () => {
      deleteSection(columnId);
      deleteTasksBySection(columnId);
      setIsDeleteModalOpen(false);
      showToast(`섹션 ${title}이/가 성공적으로 삭제되었습니다.`)
    }

    const handleDeleteStatus = () => {
      deleteStatus(columnId);
      updateTasksByStatus(columnId);
      setIsDeleteModalOpen(false);
      showToast(`상태 ${title}이/가 성공적으로 삭제되었습니다.`)
    };

    const handleClose = (closedId: string) => {
      const updatedNewCard = newCardList.filter(id => id !== closedId);
      setNewCardList(updatedNewCard);
    };


    const handleUpdate = (name: string, color?: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        showToast('이름을 입력해주세요.');
        return;
      }

      if (viewMode === ViewModes.STATUS && color) {
        const originalStatus = statusList.find(status => status.code === columnId);
        if (!originalStatus) {
          console.error("수정할 원본 상태를 찾을 수 없습니다. ID:", columnId);
          return;
        }

        // 시나리오 1: 이름과 색상 모두 변경되지 않은 경우
        if (trimmedName === originalStatus.name && color === originalStatus.colorMain) {
          showToast('변경된 내용이 없습니다.');
          setIsEditing(false);
          return;
        }

        // 시나리오 2: 이름 또는 색상 중 하나라도 변경된 경우
        // 먼저, 이름이 변경되었다면 다른 상태와 중복되는지 확인
        if (trimmedName !== originalStatus.name) {
          const isDuplicateNameWithOthers = statusList.some(
            status => status.code !== columnId && status.name === trimmedName
          );
          if (isDuplicateNameWithOthers) {
            showToast('동일한 이름의 다른 상태가 이미 존재합니다.');
            return;
          }
        }

        const statusUpdates: Partial<SelectOption> = {
          name: trimmedName,
          colorMain: color,
          colorSub: lightenColor(color, 0.85),
        };
        updateStatus(columnId, statusUpdates);

        const newStatusDataForTasks: SelectOption = {
          code: columnId,
          name: trimmedName,
          colorMain: color,
          colorSub: lightenColor(color, 0.85),
        };
        updateTasksWithNewStatusDetails(newStatusDataForTasks);
        showToast('상태 정보가 변경되었습니다.');

      } else if (viewMode === ViewModes.SECTION) {
        const originalSection = sections.find(sec => sec.sectionId === columnId);
        if (!originalSection) {
          console.error("수정할 원본 섹션을 찾을 수 없습니다. ID:", columnId);
          return;
        }

        if (trimmedName === originalSection.sectionName) {
          showToast('변경된 내용이 없습니다.');
          setIsEditing(false);
          return;
        }

        const isDuplicateWithOthers = sections.some(
          sec => sec.sectionId !== columnId && sec.sectionName === trimmedName
        );

        if (isDuplicateWithOthers) {
          showToast('동일한 이름의 다른 섹션이 이미 존재합니다.');
          return;
        }

        updateSection(columnId, { sectionName: trimmedName });
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
        <div className="section-header" style={currentHeaderStyle}>
          <ColumnHeader
            columnId={columnId} columnTitle={title} deleteActionLabel={deleteActionLabel}
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
            {tasks.map((t, index) => (
              <React.Fragment key={t.taskId}>
                {placeholderData && (
                  placeholderData.columnId === columnId &&
                  placeholderData.index === index && <div key="dnd-kit-placeholder" className="kanban-task-placeholder" />
                )}
                <CardWrapper task={t} sectionName={getSectionName(t.sectionId)} onOpenDetailModal={onOpenDetailModal} />
              </React.Fragment>
            ))}
            {/* 리스트 맨 마지막에 플레이스홀더가 와야 하는 경우 */}
            {placeholderData && (
              placeholderData.columnId === columnId &&
              placeholderData.index === tasks.length && <div key="dnd-kit-placeholder" className="kanban-task-placeholder" />
            )}
          </SortableContext>
          {newCardList.map(newCardId => (
            <NewTaskCard key={`new-card-${newCardId}`} columnId={columnId} onClose={handleClose} newCardId={newCardId} />
          ))}
          <div className="task-add" onClick={handleAddNewTask}>
            <FontAwesomeIcon icon={faPlus} style={{ width: 13, height: 13 }} />
            <div>작업 추가</div>
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