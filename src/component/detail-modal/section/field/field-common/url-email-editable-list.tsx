import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import UrlEmailEditableItem, { ItemWithIdAndValues } from "./url-email-editable-item";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

export interface GenericDndListItem {
  id: string | number;
  isNew?: boolean;
  [key: string]: any;
}

export interface UrlEmailEditableListProps<TItem extends GenericDndListItem> {
  items: TItem[];
  itemIdKey: keyof TItem & string;
  itemValue1Key: keyof TItem & string;
  itemValue2Key: keyof TItem & string;

  onUpdateItem: (id: string | number, fieldKey: string, value: string) => void;
  onDeleteItem: (id: string | number) => void;
  onOrderChange: (newOrderedItems: TItem[]) => void;

  placeholder1: string;
  placeholder2: string;
  errors?: Record<string | number, string[] | undefined>;
  noItemsMsg: string;
}

const UrlEmailEditableList = <TItem extends GenericDndListItem>({
  items, itemIdKey, itemValue1Key, itemValue2Key,
  onUpdateItem, onDeleteItem, onOrderChange,
  placeholder1, placeholder2, errors, noItemsMsg
}: UrlEmailEditableListProps<TItem>) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const dndItemIds = items.map(item => item[itemIdKey] as string | number);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item[itemIdKey] === active.id);
      const newIndex = items.findIndex(item => item[itemIdKey] === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        onOrderChange(reorderedItems);
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={dndItemIds} strategy={verticalListSortingStrategy}>
        <ul className="gantt-scrollbar-y task-detail__detail-modal-field-edit-list">
          {items.map((item, index) => (
            <UrlEmailEditableItem
              key={item[itemIdKey] as React.Key}
              dndId={item[itemIdKey] as string | number}
              item={item as ItemWithIdAndValues}
              idKey={itemIdKey as string}
              value1Key={itemValue1Key as string}
              value2Key={itemValue2Key as string}
              placeholder1={placeholder1}
              placeholder2={placeholder2}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              errors={errors}
              autoFocus={index === items.length - 1 && item.isNew === true}
            />
          ))}
          {items.length === 0 && (<li className="task-detail__detail-modal-field-edit-item--no-message">{noItemsMsg}</li>)}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

export default UrlEmailEditableList;