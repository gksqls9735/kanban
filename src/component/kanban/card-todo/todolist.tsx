import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Task, Todo } from "../../../types/type";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useState } from "react";
import useTaskStore from "../../../store/task-store";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import DraggableTodo from "./draggable-todo";
import { useKanbanActions } from "../../../context/task-action-context";

const TodoList: React.FC<{
  taskId: string;
  todoList: Todo[];
  isOwnerOrParticipant: boolean;
}> = ({ taskId, todoList, isOwnerOrParticipant }) => {
  const updateTask = useTaskStore(state => state.updateTask);
  const [showTodo, setShowTodo] = useState<boolean>(false);
  const { onTasksChange } = useKanbanActions();

  const handleTodoExtenal = (updates: Partial<Task>) => {
    updateTask(taskId, updates);
    if (onTasksChange) {
      const updatedTask = useTaskStore.getState().allTasks.find(t => t.taskId === taskId);
      if (updatedTask) onTasksChange([updatedTask]);
    }
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!active || !over || active.id === over.id) return;
    const activeIndex = todoList.findIndex(todo => todo.todoId === active.id);
    const overIndex = todoList.findIndex(todo => todo.todoId === over.id);
    if (activeIndex === -1 || overIndex === -1) return;

    const newTodoList = arrayMove(todoList, activeIndex, overIndex).map((todo, index) => ({
      ...todo, order: index,
    }));

    handleTodoExtenal({ todoList: newTodoList });
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
    if (isOwnerOrParticipant) {
      const updatedTodoList = todoList.map(items => {
        if (items.todoId === todoId) return { ...items, isCompleted: !items.isCompleted };
        return items;
      });
      handleTodoExtenal({ todoList: updatedTodoList });
    }
  };

  const handleDeleteTodo = (todoId: string) => {
    const updatedTodoList = todoList.filter(todo => todo.todoId !== todoId);
    handleTodoExtenal({ todoList: updatedTodoList });
  };

  return (
    <div className="card-todolist" onClick={e => e.stopPropagation()}>
      <div className="card-todotoggle" onClick={(e) => { e.stopPropagation(); setShowTodo(prev => !prev) }}>
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
              <DraggableTodo
                key={todo.todoId} todo={todo} isOwnerOrParticipant={isOwnerOrParticipant}
                onCompleteChange={handleTodoCompleteChange} onDelete={handleDeleteTodo} />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
};

export default TodoList;