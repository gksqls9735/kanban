import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Todo } from "../../../types/type";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useState } from "react";
import useTaskStore from "../../../store/task-store";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import DraggableTodo from "./draggable-todo";

const TodoList: React.FC<{
  taskId: string;
  todoList: Todo[];
}> = ({ taskId, todoList }) => {
  const updateTask = useTaskStore(state => state.updateTask);
  const [showTodo, setShowTodo] = useState<boolean>(false);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!active || !over || active.id === over.id) return;
    const activeIndex = todoList.findIndex(todo => todo.todoId === active.id);
    const overIndex = todoList.findIndex(todo => todo.todoId === over.id);
    if (activeIndex === -1 || overIndex === -1) return;

    const newTodoList = arrayMove(todoList, activeIndex, overIndex).map((todo, index) => ({
      ...todo, order: index,
    }));

    updateTask(taskId, { 'todoList': newTodoList });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleTodoCompleteChange = (todoId: string) => {
    const updatedTodoList = todoList.map(items => {
      if (items.todoId === todoId) return { ...items, isCompleted: !items.isCompleted };
      return items;
    });
    updateTask(taskId, { 'todoList': updatedTodoList });
  };

  const handleDeleteTodo = (todoId: string) => {
    const updatedTodoList = todoList.filter(todo => todo.todoId !== todoId);
    updateTask(taskId, { 'todoList': updatedTodoList });
  };

  return (
    <div className="card-todolist">
      <div className="card-todotoggle" onClick={() => setShowTodo(prev => !prev)}>
        <span>할 일</span>
        <span className={`card-todotoggle arrow ${showTodo ? 'arrow--open' : ''}`}>
          <FontAwesomeIcon icon={faCaretDown} style={{ width: 16, height: 16 }} />
        </span>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
      >
        <div className={`todo-list ${showTodo ? 'todo-list--open' : ''}`}>
          <SortableContext items={todoList.map(todo => todo.todoId)} strategy={verticalListSortingStrategy}>
            {todoList.map(todo => (
              <DraggableTodo key={todo.todoId} todo={todo} onCompleteChange={handleTodoCompleteChange} onDelete={handleDeleteTodo} />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
};

export default TodoList;