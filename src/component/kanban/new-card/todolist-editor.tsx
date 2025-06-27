import { useEffect, useState } from "react";
import { Todo } from "../../../types/type";
import EditableTodoItem from "../card-todo/editable-todo";
import useUserStore from "../../../store/user-store";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from "@dnd-kit/modifiers";

const TodoListEditor: React.FC<{
  initialTodos: Todo[];
  onTodosChange: (todos: Todo[]) => void;
  newTaskId: string;
}> = ({ initialTodos, onTodosChange, newTaskId }) => {
  const currentUser = useUserStore(state => state.currentUser);

  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [focusedTodoId, setFocusedTodoId] = useState<string | null>(null);

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  const handleAddTodo = () => {
    if (!currentUser) return;
    const newTodoId = `todo-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newTodo: Todo = {
      taskId: newTaskId,
      todoId: newTodoId,
      todoOwner: currentUser.username, // 실제 사용자로 변경하기
      isCompleted: false,
      todoTxt: '',
      todoDt: null,
      participants: [],
      order: todos.length,
    };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    onTodosChange(updatedTodos);
    setFocusedTodoId(newTodoId);
  };

  const handleTodoChange = (todoId: string, updatedTodo: Partial<Pick<Todo, 'todoTxt' | 'isCompleted'>>) => {
    const updatedTodos = todos.map(todo => todo.todoId === todoId ? { ...todo, ...updatedTodo } : todo);
    setTodos(updatedTodos);
    onTodosChange(updatedTodos);
    if (focusedTodoId === todoId) setFocusedTodoId(null);
  };

  const handleDeleteTodo = (todoId: string) => {
    const updatedTodos = todos.filter(todo => todo.todoId !== todoId);
    setTodos(updatedTodos);
    onTodosChange(updatedTodos);
    if (focusedTodoId === todoId) setFocusedTodoId(null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!active || !over || active.id === over.id) return;
    const activeIndex = todos.findIndex(todo => todo.todoId === active.id);
    const overIndex = todos.findIndex(todo => todo.todoId === over.id);
    if (activeIndex === -1 || overIndex === -1) return;

    const orderedTodoList = arrayMove(todos, activeIndex, overIndex).map((todo, index) => ({
      ...todo, order: index,
    }));

    onTodosChange(orderedTodoList);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );


  return (
    <div className="card-todolist">
      <div className={`todo-list todo-list--open`} style={{ marginTop: 0 }}>
        <DndContext 
          sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
        >
          <SortableContext items={todos.map(todo => todo.todoId)} strategy={verticalListSortingStrategy}>
            {todos.map(todo => (
              <EditableTodoItem
                key={todo.todoId}
                todo={todo}
                onChange={handleTodoChange}
                onDelete={handleDeleteTodo}
                // 현재 포커스 대상 ID와 일치하면 autoFocus prop을 true로 전달
                autoFocus={todo.todoId === focusedTodoId}
              />
            ))}
          </SortableContext>
        </DndContext>
        <div className="card-add-todo">
          <div onClick={handleAddTodo}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="#7D8998" className="bi bi-plus-lg" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
            </svg>
          </div>
          <div className="card-add-todo__text" onClick={handleAddTodo}>
            할 일 추가
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoListEditor;