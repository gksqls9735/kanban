import UrlEmailEditableItem, { ItemWithIdAndValues } from "./url-email-editable-item";

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
}: UrlEmailEditableListProps<TExistingItem, TNewFormItem>) => {
  return (
    <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
      {existingItems.map(item => (
        <UrlEmailEditableItem
          key={item[existingItemIdKey] as React.Key}
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
  );
};

export default UrlEmailEditableList;