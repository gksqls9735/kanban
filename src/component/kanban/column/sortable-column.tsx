import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DroppableColumn from './droppable-column';
import { Task } from '../../../types/type';

const SortableColumn: React.FC<{
  col: { id: string, title: string, colorMain: string | undefined, colorSub: string | undefined };
  getSectionName: (sectionId: string) => string;
  placeholderData: { columnId: string; index: number } | null;
  getTasksForColumn: (columnId: string) => Task[];
  onAddBefore: (targetColumnId: string) => void;
  onAddAfter: (targetColumnId: string) => void;
  onOpenDetailModal: (taskId: string) => void;
}> = ({ col, getSectionName, placeholderData, getTasksForColumn, onAddBefore, onAddAfter, onOpenDetailModal }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col.id, data: { type: 'Column', columnId: col.id } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    minWidth: 260,
    flexShrink: 0,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="kanban-section">
      <DroppableColumn
        key={col.id}
        columnId={col.id}
        title={col.title}
        tasks={getTasksForColumn(col.id)}
        getSectionName={getSectionName}
        colorMain={col.colorMain}
        colorSub={col.colorSub}
        onAddBefore={onAddBefore}
        onAddAfter={onAddAfter}
        onOpenDetailModal={onOpenDetailModal}
        placeholderData={placeholderData}
        listeners={listeners}
      />
    </div>
  );
};

export default SortableColumn;