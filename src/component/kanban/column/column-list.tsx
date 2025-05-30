import { SelectOption, Task } from "../../../types/type";
import useViewModeStore from "../../../store/viewmode-store";
import useTaskStore from "../../../store/task-store";
import { colors, ViewModes } from "../../../constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import { lightenColor } from "../../../utils/color-function";
import DroppableColumn from "./droppable-column";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import useSectionsStore from "../../../store/sections-store";
import useStatusesStore from "../../../store/statuses-store";
import ColumnCreate from "./column-create";
import { useToast } from "../../../context/toast-context";
import { generateUniqueId } from "../../../utils/text-function";
import useUserStore from "../../../store/user-store";
import DetailModal from "../../detail-modal/detail-modal";
import DeleteModal from "../delete-modal";

const ColumnList: React.FC<{
  getSectionName: (sectionId: string) => string;
  placeholderData: { columnId: string; index: number } | null;
}> = ({ getSectionName, placeholderData }) => {
  const [isAddingSection, setIsAddingSection] = useState<boolean>(false);
  // 상세 보기 창
  const [detailedTask, setDetailedTask] = useState<Task | null>(null);
  // 상세 보기 창에서 삭제 창
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

  const { showToast } = useToast();
  const viewMode = useViewModeStore(state => state.viewMode);
  const tasks = useTaskStore(state => state.allTasks);
  const deleteTask = useTaskStore(state => state.deleteTask);

  const statusList = useStatusesStore(state => state.statusList);
  const addStatus = useStatusesStore(state => state.addStatus);
  const insertStatus = useStatusesStore(state => state.insertStatus);

  const sections = useSectionsStore(state => state.sections);
  const addSection = useSectionsStore(state => state.addSection);
  const insertSection = useSectionsStore(state => state.insertSection);

  const currentUser = useUserStore(state => state.currentUser);

  // 상세보기 로직
  const handleOpenDetailModal = (taskId: string) => {
    const taskToDetail = tasks.find(t => t.taskId === taskId);
    if (taskToDetail) setDetailedTask(taskToDetail);
  };

  const handleCloseDetailModal = () => {
    setDetailedTask(null);
  };

  const handleDeleteRequestFromDetail = () => {
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDeleteTask = () => {
    if (detailedTask) {
      deleteTask(detailedTask.taskId);
      showToast('작업이 성공적으로 삭제되었습니다.');
      handleCloseDetailModal();
      setIsDeleteConfirmationOpen(false);
    }
  };

  const getAllUniqueUserIds = useCallback(() => {
    const allIds = tasks.flatMap(t => {
      const onwerId = t.taskOwner ? [t.taskOwner.id] : [];
      const participantIds = t.participants ? t.participants.map(p => p.id) : [];
      return [...onwerId, ...participantIds];
    });
    const uniqueIds = new Set(allIds);
    return Array.from(uniqueIds);
  }, [tasks]);

  const uniqueUserIds = useMemo(() => getAllUniqueUserIds(), [getAllUniqueUserIds]);
  const isOwnerOrParticipant = useMemo(() => uniqueUserIds.some(uId => uId === currentUser!.id), [uniqueUserIds]);

  useEffect(() => {
    setIsAddingSection(false);
  }, [viewMode]);

  const getTasksForColumn = useCallback((columnId: string): Task[] => {
    return tasks
      .filter(t => (viewMode === ViewModes.STATUS ? t.status.code : t.sectionId) === columnId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [tasks, viewMode]);

  const baseColumns = useMemo(() => {
    return viewMode === ViewModes.STATUS
      ? statusList.map(status => ({
        id: status.code,
        title: status.name,
        colorMain: status.colorMain,
        colorSub: status.colorSub || lightenColor(status.colorMain, 0.85),
      }))
      : sections.map(sec => ({
        id: sec.sectionId,
        title: sec.sectionName,
        colorMain: undefined,
        colorSub: undefined,
      }));
  }, [viewMode, statusList, sections]); // getTasksForColumn 의존성 제거

  const allColumnIds = useMemo(() => baseColumns.map(col => col.id), [baseColumns]);

  const handleAddNewItem = (name: string, color?: string) => {
    const trimmedName = name.trim();
    if (trimmedName) {
      if (viewMode === ViewModes.STATUS && color) {
        const isExistStatusName = statusList.some(status => status.name === trimmedName);
        if (!isExistStatusName) {
          addStatus({ name: trimmedName, colorMain: color, colorSub: lightenColor(color, 0.85) });
          showToast('상태가 등록 되었습니다.');
        } else {
          showToast('동일한 이름의 상태가 존재합니다.');
          return;
        }
      } else if (viewMode === ViewModes.SECTION) {
        const isExistSectionName = sections.some(sec => sec.sectionName === trimmedName);
        if (!isExistSectionName) {
          addSection(trimmedName);
          showToast('섹션이 추가 되었습니다.')
        } else {
          showToast('동일한 이름의 섹션이 존재합니다.');
          return;
        }
      }
      setIsAddingSection(false);
    }
  };

  const toggle = () => {
    setIsAddingSection(prev => !prev);
  };

  const handleAddBefore = useCallback((targetColumnId: string) => {
    if (viewMode === ViewModes.SECTION) {
      insertSection(targetColumnId, 'before');
    } else if (viewMode === ViewModes.STATUS) {
      const newColor = colors[0];
      const newStatusData: SelectOption = {
        code: generateUniqueId('status'),
        name: '제목 없는 상태',
        colorMain: newColor,
        colorSub: lightenColor(newColor, 0.85),
      }
      insertStatus(targetColumnId, newStatusData, 'before');
    }
  }, [viewMode, insertSection, insertStatus]);

  const handleAddAfter = useCallback((targetColumnId: string) => {
    if (viewMode === ViewModes.SECTION) {
      insertSection(targetColumnId, 'after');
    } else if (viewMode === ViewModes.STATUS) {
      const newColor = colors[0];
      const newStatusData: SelectOption = {
        code: generateUniqueId('status'),
        name: '제목 없는 상태',
        colorMain: newColor,
        colorSub: lightenColor(newColor, 0.85),
      }
      insertStatus(targetColumnId, newStatusData, 'after');
    }
  }, [viewMode, insertSection, insertStatus]);

  return (
    <>
      <SortableContext items={allColumnIds} strategy={horizontalListSortingStrategy}>
        <div className="kanban-content">
          {baseColumns.map(col => (
            <DroppableColumn
              key={col.id}
              columnId={col.id}
              title={col.title}
              tasks={getTasksForColumn(col.id)}
              getSectionName={getSectionName}
              colorMain={col.colorMain}
              colorSub={col.colorSub}
              onAddBefore={handleAddBefore}
              onAddAfter={handleAddAfter}
              onOpenDetailModal={handleOpenDetailModal}
              placeholderData={placeholderData}
            />
          ))}
          {isAddingSection && isOwnerOrParticipant && (
            <ColumnCreate viewMode={viewMode} isAdd={isAddingSection} onAdd={handleAddNewItem} toggle={toggle} />
          )}

          {isOwnerOrParticipant && (
            <div className="add-section-button" onClick={() => setIsAddingSection(prev => !prev)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#7d8998" className="bi bi-plus-lg" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
              </svg>
            </div>
          )}
        </div>
      </SortableContext >
      {detailedTask && (
        <DetailModal
          task={detailedTask}
          onClose={handleCloseDetailModal}
          openDeleteModal={(e) => {
            e.stopPropagation();
            handleDeleteRequestFromDetail();
          }}
        />
      )}
      {isDeleteConfirmationOpen && detailedTask && (
        <DeleteModal
          message={`작업 '${detailedTask.taskName}'을(를) 삭제하시겠습니까?`}
          onCancel={() => setIsDeleteConfirmationOpen(false)}
          onConfirm={confirmDeleteTask}
        />
      )}
    </>
  );
};

export default ColumnList;