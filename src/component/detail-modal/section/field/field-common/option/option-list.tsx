import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import OptionRow from "./option-row";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CombinedOptionItem } from "../../single-selection";

const OptionList: React.FC<{
  options: CombinedOptionItem[],
  onUpdate: (code: string, field: string, value: string) => void;
  onDelete: (code: string) => void;
  onColorUpdate: (code: string, colorMain: string, colorSub: string) => void;
  onOrderChange: (newOrderedItems: CombinedOptionItem[]) => void;
}> = ({
  options, onUpdate, onDelete, onColorUpdate, onOrderChange
}) => {

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const dndItemIds = options.map(option => option.code);

    const handleDragEnd = (e: DragEndEvent) => {
      const { active, over } = e;

      if (over && active.id !== over.id) {
        const oldIndex = options.findIndex(opt => opt.code === active.id);
        const newIndex = options.findIndex(opt => opt.code === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedItems = arrayMove(options, oldIndex, newIndex);
          onOrderChange(reorderedItems);
        }
      }
    };

    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={dndItemIds} strategy={verticalListSortingStrategy}>
          <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
            {options.length > 0 ? (
              options.map((option, index) =>
                <OptionRow
                  key={option.code} option={option}
                  onUpdate={onUpdate} onDelete={onDelete} onColorUpdate={onColorUpdate} onOrderChange={onOrderChange}
                  autoFocus={index === options.length - 1 && option.isNew === true}
                />
              )
            ) : (
              <li className="task-detail__detail-modal-field-edit-item--no-message">
                관리할 옵션이 없습니다.
              </li>
            )}
          </ul>
        </SortableContext>
      </DndContext>
    );
  };

export default OptionList;