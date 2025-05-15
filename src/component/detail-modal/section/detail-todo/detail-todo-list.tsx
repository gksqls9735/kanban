import { useState } from "react";
import { Todo } from "../../../../types/type";
import DetailTodoItem from "./detail-todo-item/detail-todo-item";
import { generateUniqueId } from "../../../../utils/text-function";
import useUserStore from "../../../../store/user-store";
import DetailTodoAdd from "./detail-todo-item/detail-todo-add";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

const DetailTodoList: React.FC<{
  initialTodoList: Todo[], setInitialTodoList: (list: Todo[]) => void; taskId: string;
}> = ({ initialTodoList, setInitialTodoList, taskId }) => {
  const currentUser = useUserStore(state => state.currentUser);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!active || !over || active.id === over.id) return;
    const activeIdx = initialTodoList.findIndex(todo => todo.todoId === active.id);
    const overIdx = initialTodoList.findIndex(todo => todo.todoId === over.id);
    if (activeIdx === -1 || overIdx === -1) return;

    const updatedList = arrayMove(initialTodoList, activeIdx, overIdx).map((todo, idx) => ({
      ...todo, order: idx,
    }));

    setInitialTodoList(updatedList);

  };

  const [isAddTask, setIsAddTask] = useState<boolean>(false);

  const handleAddTask = (todoTxt: string, isComplete: boolean) => {
    const newTask: Todo = {
      taskId: taskId,
      todoId: generateUniqueId('todo'),
      todoOwner: currentUser!.username,
      isCompleted: isComplete,
      todoTxt: todoTxt,
      todoDt: new Date(),
      participants: [],
      order: initialTodoList.length + 1,
    }
    const updatedList = [...initialTodoList, newTask];
    setInitialTodoList(updatedList);
    setIsAddTask(false);
  }

  const handleIsAddTask = () => {
    setIsAddTask(prev => !prev);
  };

  const handleDeleteTodo = (todoId: string) => {
    const updatedList = initialTodoList.filter(todo => todo.todoId !== todoId);
    setInitialTodoList(updatedList);
  };

  const handleCompleteTodo = (todoId: string) => {
    const updatedList = initialTodoList.map(todo =>
      todo.todoId === todoId ? { ...todo, isCompleted: !todo.isCompleted } : todo
    );
    setInitialTodoList(updatedList);
  };

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
          <SortableContext items={initialTodoList.map(todo => todo.todoId)} strategy={verticalListSortingStrategy}>
            {initialTodoList.map(todo => (
              <DetailTodoItem key={todo.todoId} todo={todo} onDelete={handleDeleteTodo} onComplete={handleCompleteTodo} />
            ))}
            {isAddTask && (
              <DetailTodoAdd handleIsAddTask={handleIsAddTask} onAdd={handleAddTask} />
            )}
          </SortableContext>
          {!isAddTask && (
            <li className="task-detail__detail-modal-todo-item task-detail__detail-modal-todo-add-item" onClick={handleIsAddTask}>
              <div className="task-detail__detail-modal-todo-add-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="#7D8998" className="bi bi-plus-lg" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                </svg>
              </div>
              <div className="task-detail__detail-modal-todo-add-text">할 일 추가</div>
            </li>
          )}
        </ul>
      </DndContext>
    </div>
  );
};

export default DetailTodoList;