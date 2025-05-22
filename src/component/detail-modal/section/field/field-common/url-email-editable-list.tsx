import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import UrlEmailEditableItem, { ItemWithIdAndValues } from "./url-email-editable-item";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

export interface GenericEditableItem {
  [key: string]: any;
}

export interface UrlEmailEditableListProps<
  TExistingItem extends GenericEditableItem,
  TNewFormItem extends GenericEditableItem
> {
  existingItems: TExistingItem[];
  existingItemIdKey: keyof TExistingItem & string;
  existingItemValue1Key: keyof TExistingItem & string;
  existingItemValue2Key: keyof TExistingItem & string;
  onUpdateExistingItem: (id: string | number, fieldKey: string, value: string) => void;
  onDeleteExistingItem: (id: string | number) => void;

  newForms: TNewFormItem[];
  newFormTempIdKey: keyof TNewFormItem & string;
  newFormValue1Key: keyof TNewFormItem & string;
  newFormValue2Key: keyof TNewFormItem & string;
  onUpdateNewForm: (tempId: string | number, fieldKey: string, value: string) => void;
  onRemoveNewForm: (tempId: string | number) => void;

  placeholder1: string;
  placeholder2: string;
  errors?: Record<string | number, string[] | undefined>;
  noItemsMsg: string;

  onOrderChange: (newOrderedExistingItems: TExistingItem[], newOrderedNewForms: TNewFormItem[]) => void;
}

const UrlEmailEditableList = <
  TExistingItem extends GenericEditableItem,
  TNewFormItem extends GenericEditableItem
>({
  existingItems,
  existingItemIdKey,
  existingItemValue1Key,
  existingItemValue2Key,
  onUpdateExistingItem,
  onDeleteExistingItem,

  newForms,
  newFormTempIdKey,
  newFormValue1Key,
  newFormValue2Key,
  onUpdateNewForm,
  onRemoveNewForm,

  placeholder1,
  placeholder2,
  errors,
  noItemsMsg,

  onOrderChange
}: UrlEmailEditableListProps<TExistingItem, TNewFormItem>) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const dndItemIds = [
    ...existingItems.map(item => item[existingItemIdKey] as string | number),
    ...newForms.map(form => form[newFormTempIdKey] as string | number),
  ];

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (over && active.id !== over.id) {
      const combinedItems: Array<{ id: string | number; type: 'existing' | 'new'; data: TExistingItem | TNewFormItem }> = [
        ...existingItems.map(item => ({ id: item[existingItemIdKey] as string | number, type: 'existing' as 'existing', data: item })),
        ...newForms.map(form => ({ id: form[newFormTempIdKey] as string | number, type: 'new' as 'new', data: form })),
      ];

      const oldIndex = combinedItems.findIndex(item => item.id === active.id);
      const newIndex = combinedItems.findIndex(item => item.id === over.id);

      const reorderedCombinedItems = arrayMove(combinedItems, oldIndex, newIndex);

      const newOrderedExistingItems: TExistingItem[] = [];
      const newOrderedNewForms: TNewFormItem[] = [];

      reorderedCombinedItems.forEach(item => {
        if (item.type === 'existing') {
          newOrderedExistingItems.push(item.data as TExistingItem);
        } else {
          newOrderedNewForms.push(item.data as TNewFormItem);
        }
      });
      onOrderChange(newOrderedExistingItems, newOrderedNewForms);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={dndItemIds} strategy={verticalListSortingStrategy}>
        <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
          {existingItems.map(item => (
            <UrlEmailEditableItem
              key={item[existingItemIdKey] as React.Key}
              dndId={item[existingItemIdKey] as string | number} 
              item={item as ItemWithIdAndValues}
              idKey={existingItemIdKey}
              value1Key={existingItemValue1Key}
              value2Key={existingItemValue2Key}
              placeholder1={placeholder1}
              placeholder2={placeholder2}
              onUpdate={onUpdateExistingItem}
              onDelete={onDeleteExistingItem}
              errors={errors}
            />
          ))}
          {newForms.map((form, index) => (
            <UrlEmailEditableItem
              key={form[newFormTempIdKey] as React.Key}
              dndId={form[newFormTempIdKey] as string | number} 
              item={form as ItemWithIdAndValues}
              idKey={newFormTempIdKey}
              value1Key={newFormValue1Key}
              value2Key={newFormValue2Key}
              placeholder1={placeholder1}
              placeholder2={placeholder2}
              onUpdate={onUpdateNewForm}
              onDelete={onRemoveNewForm}
              errors={errors}
              autoFocus={index === newForms.length - 1}
            />
          ))}
          {existingItems.length === 0 && newForms.length === 0 && (
            <li className="task-detail__detail-modal-field-edit-item--no-message">{noItemsMsg}</li>
          )}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

export default UrlEmailEditableList;