import { useEffect, useState } from "react";
import DetailTodoItem from "./detail-todo-item/detail-todo-item";
import DetailTodoAdd from "./detail-todo-item/detail-todo-add";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Todo } from "../../../../types/type";
import useUserStore from "../../../../store/user-store";
import { generateUniqueId, normalizeSpaces } from "../../../../utils/text-function";
import isEqual from "lodash.isequal"; 

export interface CombinedTodoItem { // 인터페이스 정의
  todoId: string;
  isCompleted: boolean;
  todoTxt: string;
  todoDt: Date | null;
  isNew: boolean;
  order: number;
}
const DetailTodoList: React.FC<{
  initialTodoList: Todo[];
  onTodoListUpdate: (list: Todo[]) => void;
  taskId: string;
  isOwnerOrParticipant: boolean;
}> = ({ initialTodoList, onTodoListUpdate, taskId, isOwnerOrParticipant }) => {
  const currentUser = useUserStore(state => state.currentUser);
  const [combinedItems, setCombinedItems] = useState<CombinedTodoItem[]>([]);

  useEffect(() => {

    const existingTodosAsCombined: CombinedTodoItem[] = initialTodoList.map((todo, index) => ({
      todoId: todo.todoId,
      isCompleted: todo.isCompleted,
      todoTxt: normalizeSpaces(todo.todoTxt),
      todoDt: todo.todoDt,
      isNew: false,
      order: todo.order !== undefined ? todo.order : index,
    }));

    const newItemsInProgress = combinedItems.filter(item =>
      item.isNew && !existingTodosAsCombined.some(existing => existing.todoId === item.todoId)
    );

    const allItems = [
      ...existingTodosAsCombined,
      ...newItemsInProgress
    ];

    allItems.sort((a, b) => a.order - b.order);

    if (!isEqual(combinedItems, allItems)) {
      console.log("DetailTodoList: Updating combinedItems state.");
      setCombinedItems(allItems);
    } else {
      console.log("DetailTodoList: combinedItems are content-equal, skipping update.");
    }
  }, [initialTodoList, currentUser]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // 우선 isNew가 false인걸로 가정정
  const handleDragEnd = (e: DragEndEvent) => {
    if (!isOwnerOrParticipant) return;
    const { active, over } = e;
    if (!active || !over || active.id === over.id) return;

    const sortableCombinedItems = combinedItems.filter(item => !item.isNew);
    
    const activeIdx = sortableCombinedItems.findIndex(item => item.todoId === active.id);
    const overIdx = sortableCombinedItems.findIndex(item => item.todoId === over.id);

    if (activeIdx === -1 || overIdx === -1) {
        console.warn("Drag end: Active or over item not found in sortableCombinedItems.");
        return;
    }

    const reorderedCombinedItems = arrayMove(sortableCombinedItems, activeIdx, overIdx);

    const updatedCombinedItemsWithOrder = reorderedCombinedItems.map((item, idx) => ({
        ...item,
        order: idx,
    }));
    
    const updatedTodoItems: Todo[] = updatedCombinedItemsWithOrder.map(item => ({
        taskId: taskId,
        todoId: item.todoId,
        todoOwner: currentUser ? currentUser.username : 'Unknown',
        isCompleted: item.isCompleted,
        todoTxt: item.todoTxt,
        todoDt: item.todoDt,
        participants: [],
        order: item.order,
    }));

    onTodoListUpdate(updatedTodoItems);
    setCombinedItems(updatedCombinedItemsWithOrder);
  };

  const handleAddNewItemField = () => {
    const newTempId = generateUniqueId('new-todo');
    const newItemOrder = combinedItems.length > 0 ? Math.max(...combinedItems.map(item => item.order)) + 1 : 0;

    const newItem: CombinedTodoItem = {
      todoId: newTempId,
      isCompleted: false,
      todoTxt: "",
      todoDt: null,
      isNew: true,
      order: newItemOrder,
    };
    setCombinedItems(prev => [...prev, newItem]);
  };

  const handleSaveNewItem = (tempTodoId: string, todoTxt: string, isCompleted: boolean) => {
    if (!currentUser) return;

    const processedTodoTxt = normalizeSpaces(todoTxt);
    if (processedTodoTxt === "") return;

    const newActualTodoId = generateUniqueId('todo');
    const newOrder = initialTodoList.length > 0 ? Math.max(...initialTodoList.map(item => item.order)) + 1 : 0;

    const newTodo: Todo = {
      taskId: taskId,
      todoId: newActualTodoId,
      todoOwner: currentUser.username,
      isCompleted: isCompleted,
      todoTxt: processedTodoTxt,
      todoDt: null, // 또는 new Date()
      participants: [],
      order: newOrder,
    };

    // 부모에게 전달
    onTodoListUpdate([...initialTodoList, newTodo]);

    // isNew였던 임시 항복 제거 새로 추가된 Todo를 isNew: false인 combinedItems로 반영
    // useEffect에서 initialTodoList 변경 시 combinedItems가 재구성되므로 임시항목만 제거
    setCombinedItems(prev => {
      // 임시 항목 제거
      const itemsWithoutTemp = prev.filter(item => item.todoId !== tempTodoId);
      const savedItemAsCombined: CombinedTodoItem = {
        ...newTodo,
        isNew: false,
      };
      const updatedItems = [...itemsWithoutTemp, savedItemAsCombined];
      updatedItems.sort((a, b) => a.order - b.order);
      return updatedItems;
    });
  };

  // DetailTodoAddComponent에서 취소 요청 시 (임시 항목 제거)
  const handleCancelNewItem = (todoId: string) => {
    setCombinedItems(prev => prev.filter(item => item.todoId !== todoId));
  };

  // 기존 항목 삭제
  const handleDeleteExistingTodo = (todoId: string) => {
    onTodoListUpdate(initialTodoList.filter(todo => todo.todoId !== todoId));
  };

  // 기존 항목 완료 / 미완료 토글 
  const handleCompleteExistingTodo = (todoId: string) => {
    if (!isOwnerOrParticipant) return;
    onTodoListUpdate(
      initialTodoList.map(todo =>
        todo.todoId === todoId ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  };

  const handleUpdateExistingTodoTxt = (todoId: string, newTodoTxt: string) => {
    if (!isOwnerOrParticipant) return;
    const processedTodoTxt = normalizeSpaces(newTodoTxt);
    if (processedTodoTxt === "") return;

    onTodoListUpdate(
      initialTodoList.map(todo => todo.todoId === todoId ? { ...todo, todoTxt: processedTodoTxt } : todo)
    );
  };

  const handleUpdateExistingTodoDt = (todoId: string, newTodoDt: Date | null) => {
    onTodoListUpdate(
      initialTodoList.map(todo => todo.todoId === todoId ? { ...todo, todoDt: newTodoDt } : todo)
    );
  };

  const sortableItemIds = combinedItems.filter(item => !item.isNew).map(item => item.todoId);

  return (
    <div className="task-detail__detail-modal-section">
      <div className="task-detail__detail-modal-section--field-title">할 일</div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
      >
        <ul className="task-detail__detail-modal-todo-list">
          <SortableContext items={sortableItemIds} strategy={verticalListSortingStrategy}>
            {combinedItems.map(item => (
              !item.isNew ? (
                <DetailTodoItem
                  key={item.todoId}
                  item={item}
                  onDelete={handleDeleteExistingTodo}
                  onCompleteChange={handleCompleteExistingTodo}
                  isOwnerOrParticipant={isOwnerOrParticipant}
                  onUpdateTodoTxt={handleUpdateExistingTodoTxt}
                  onUpdateTodoDt={handleUpdateExistingTodoDt}
                />
              ) : (
                <DetailTodoAdd key={item.todoId} item={item} onSave={handleSaveNewItem} onCancel={handleCancelNewItem} />
              )))}
          </SortableContext>
        </ul>
      </DndContext>
      {isOwnerOrParticipant && (
        <div className="task-detail__detail-modal-todo-item task-detail__detail-modal-todo-add-item" onClick={handleAddNewItemField}>
          <div className="task-detail__detail-modal-todo-add-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="#7D8998" className="bi bi-plus-lg" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
            </svg>
          </div>
          <div className="task-detail__detail-modal-todo-add-text">할 일 추가</div>
        </div>
      )}
    </div>
  );
};

export default DetailTodoList;