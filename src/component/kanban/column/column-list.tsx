import { SelectOption, Task } from "../../../types/type";
import useViewModeStore from "../../../store/viewmode-store";
import useTaskStore from "../../../store/task-store";
import { colors, ViewModes } from "../../../constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import { lightenColor } from "../../../utils/color-function";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import useSectionsStore from "../../../store/sections-store";
import useStatusesStore from "../../../store/statuses-store";
import ColumnCreate from "./column-create";
import { useToast } from "../../../context/toast-context";
import { generateUniqueId, getNextUntitledName, normalizeSpaces } from "../../../utils/text-function";
import useUserStore from "../../../store/user-store";
import DetailModal from "../../detail-modal/detail-modal";
import DeleteModal from "../delete-modal";
import SortableColumn from "./sortable-column";
import { useKanbanActions } from "../../../context/task-action-context";

const ColumnList: React.FC<{
  getSectionName: (sectionId: string) => string;
  placeholderData: { columnId: string; index: number } | null;
  detailModalTopPx: number;
}> = ({ getSectionName, placeholderData, detailModalTopPx }) => {
  const [isAddingSection, setIsAddingSection] = useState<boolean>(false);
  // 상세 보기 창
  const [detailedTask, setDetailedTask] = useState<Task | null>(null);
  // 상세 보기 창에서 삭제 창
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

  const { showToast } = useToast();
  const viewMode = useViewModeStore(state => state.viewMode);
  const tasks = useTaskStore(state => state.allTasks);
  const deleteTask = useTaskStore(state => state.deleteTask);
  const { onTasksDelete, onStatusesChange, onSectionsChange } = useKanbanActions();

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
      if (onTasksDelete) onTasksDelete(detailedTask.taskId);
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
  const isOwnerOrParticipant = useMemo(() => currentUser ? uniqueUserIds.some(uId => uId === currentUser.id) : false, [uniqueUserIds, currentUser]);

  useEffect(() => {
    setIsAddingSection(false);
  }, [viewMode]);

  const getTasksForColumn = useCallback((columnId: string): Task[] => {
    return tasks
      .filter(t => (viewMode === ViewModes.STATUS ? (t.status?.code || '') : (t.sectionId || '')) === columnId)
      .sort((a, b) => {
        if (viewMode === ViewModes.STATUS) {
          return (a.statusOrder ?? 0) - (b.statusOrder ?? 0); // STATUS 모드일 때는 statusOrder로 정렬
        } else { // ViewModes.SECTION
          return (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0); // SECTION 모드일 때는 sectionOrder로 정렬
        }
      });
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

  const handleAddNewItem = (name: string, color?: string): boolean => {
    let processedName = normalizeSpaces(name);

    if (!processedName) {
      showToast('상태/섹션 이름을 입력해주세요.');
      return false;
    }

    if (viewMode === ViewModes.STATUS && color) {
      const isExistStatusName = statusList.some(status => normalizeSpaces(status.name) === processedName);
      if (!isExistStatusName) {
        addStatus({ name: processedName, colorMain: color, colorSub: lightenColor(color, 0.85) });
        handleAddStatus();
        showToast('상태가 등록 되었습니다.');
        return true;
      } else {
        showToast('동일한 이름의 상태가 존재합니다.');
        return false;
      }
    } else if (viewMode === ViewModes.SECTION) {
      const isExistSectionName = sections.some(sec => normalizeSpaces(sec.sectionName) === processedName);
      if (!isExistSectionName) {
        addSection(processedName);
        handleAddSection();
        showToast('섹션이 추가 되었습니다.');
        return true;
      } else {
        showToast('동일한 이름의 섹션이 존재합니다.');
        return false;
      }
    }
    return false;
  };

  const toggle = () => {
    setIsAddingSection(prev => !prev);
  };

  const handleAddBefore = useCallback((targetColumnId: string) => {
    if (viewMode === ViewModes.SECTION) {
      insertSection(targetColumnId, 'before');
      handleAddSection();
    } else if (viewMode === ViewModes.STATUS) {
      const newColor = colors[0];
      const newStatusName = getNextUntitledName('이름 없는 상태', statusList);

      const newStatusData: SelectOption = {
        code: generateUniqueId('status'),
        name: newStatusName,
        colorMain: newColor,
        colorSub: lightenColor(newColor, 0.85),
      }
      insertStatus(targetColumnId, newStatusData, 'before');
      handleAddStatus();
      showToast(`상태가 등록 되었습니다.`);
    }
  }, [viewMode, insertSection, insertStatus, showToast, statusList]);

  const handleAddAfter = useCallback((targetColumnId: string) => {
    if (viewMode === ViewModes.SECTION) {
      insertSection(targetColumnId, 'after');
      handleAddSection();
    } else if (viewMode === ViewModes.STATUS) {
      const newColor = colors[0];
      const newStatusName = getNextUntitledName('이름 없는 상태', statusList);

      const newStatusData: SelectOption = {
        code: generateUniqueId('status'),
        name: newStatusName,
        colorMain: newColor,
        colorSub: lightenColor(newColor, 0.85),
      }
      insertStatus(targetColumnId, newStatusData, 'after');
      handleAddStatus();
      showToast(`상태가 등록 되었습니다.`);
    }
  }, [viewMode, insertSection, insertStatus, showToast, statusList]);

  const handleAddSection = () => {
    if (onSectionsChange) {
      const newSections = useSectionsStore.getState().sections;
      onSectionsChange(newSections);
    }
  };

  const handleAddStatus = () => {
    if (onStatusesChange) {
      const newStatusList = useStatusesStore.getState().statusList;
      onStatusesChange(newStatusList);
    }
  };


  return (
    <>
      <SortableContext items={allColumnIds} strategy={horizontalListSortingStrategy}>
        <div className="kanban-content">
          {baseColumns.map(col => (
            <SortableColumn
              key={col.id}
              col={col}
              getSectionName={getSectionName}
              placeholderData={placeholderData}
              getTasksForColumn={getTasksForColumn}
              onAddBefore={handleAddBefore}
              onAddAfter={handleAddAfter}
              onOpenDetailModal={handleOpenDetailModal}
            />
          ))}
          {isAddingSection && isOwnerOrParticipant && (
            <ColumnCreate viewMode={viewMode} isAdd={isAddingSection} onAdd={handleAddNewItem} toggle={toggle} />
          )}

          {isOwnerOrParticipant && (
            <div className="add-section-button" onClick={() => setIsAddingSection(prev => !prev)}>
              {!isAddingSection ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#7d8998" className="bi bi-plus-lg" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#7d8998" className="bi bi-x-lg" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                </svg>
              )}
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
          detailModalTopPx={detailModalTopPx}
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