import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Task, Todo } from "../../../types/type";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import useTaskStore from "../../../store/task-store";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import DraggableTodo from "./draggable-todo";
import { useKanbanActions } from "../../../context/task-action-context";
import useUserStore from "../../../store/user-store";
import { generateUniqueId, normalizeSpaces } from "../../../utils/text-function";

const TodoList: React.FC<{
  taskId: string;
  todoList: Todo[];
  isOwnerOrParticipant: boolean;
}> = ({ taskId, todoList, isOwnerOrParticipant }) => {
  const updateTask = useTaskStore(state => state.updateTask);
  const currentUser = useUserStore(state => state.currentUser);
  const [showTodo, setShowTodo] = useState<boolean>(false);
  const { onTasksChange } = useKanbanActions();

  const [localTodos, setLocalTodos] = useState<Todo[]>(todoList);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  useEffect(() => {
    setLocalTodos(todoList)
  }, [todoList]);

  const handleTodoExternal = (updates: Partial<Task>) => {
    updateTask(taskId, updates);
    if (onTasksChange) {
      const updatedTask = useTaskStore.getState().allTasks.find(t => t.taskId === taskId);
      if (updatedTask) onTasksChange([updatedTask]);
    }
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!active || !over || active.id === over.id) return;
    setLocalTodos(prev => {
      const activeIdx = prev.findIndex(todo => todo.todoId === active.id);
      const overIdx = prev.findIndex(todo => todo.todoId === over.id);
      if (activeIdx === -1 || overIdx === -1) return prev;

      const newTodoList = arrayMove(prev, activeIdx, overIdx).map((todo, idx) => ({
        ...todo, order: idx,
      }));
      handleTodoExternal({ todoList: newTodoList });
      return newTodoList;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8, } }),
    useSensor(KeyboardSensor)
  );

  const handleTodoCompleteChange = (todoId: string) => {
    if (isOwnerOrParticipant) {
      const updatedTodoList = localTodos.map(item =>
        item.todoId === todoId ? { ...item, isCompleted: !item.isCompleted } : item
      );
      setLocalTodos(updatedTodoList);
      handleTodoExternal({ todoList: updatedTodoList });
    }
  };

  const handleDeleteTodo = (todoId: string) => {
    const updatedTodoList = localTodos.filter(todo => todo.todoId !== todoId);
    setLocalTodos(updatedTodoList);
    handleTodoExternal({ todoList: updatedTodoList });
    if (editingTodoId === todoId) setEditingTodoId(null);
  };

  const handleAddTodo = () => {
    if (!currentUser) return;
    const newTodoId = generateUniqueId('todo');
    const newTodo: Todo = {
      taskId: taskId,
      todoId: newTodoId,
      todoOwner: currentUser.username,
      isCompleted: false,
      todoTxt: '',
      todoDt: null,
      participants: [],
      order: localTodos.length,
    };
    const updatedTodos = [...localTodos, newTodo];
    setLocalTodos(updatedTodos);
    setEditingTodoId(newTodoId);
  };

  const handleStartEdit = (todoId: string) => {
    if (isOwnerOrParticipant) setEditingTodoId(todoId);
  };

  const handleTodoTextChange = (todoId: string, text: string) => {
    const updatedTodos = localTodos.map(todo =>
      todo.todoId === todoId ? { ...todo, todoTxt: text } : todo
    );
    setLocalTodos(updatedTodos);
  };

  const handleEndEdit = () => {
    const editedItem = localTodos.find(todo => todo.todoId === editingTodoId);
    if (!editedItem) {
      setEditingTodoId(null);
      return;
    }

    const normalizedText = normalizeSpaces(editedItem.todoTxt);

    if (normalizedText === '') {
      const isNewItem = !todoList.some(originalTodo => originalTodo.todoId === editingTodoId);

      if (isNewItem) {
        const finalTodos = localTodos.filter(todo => todo.todoId !== editingTodoId);
        setLocalTodos(finalTodos);
        handleTodoExternal({ todoList: finalTodos });
      } else {
        setLocalTodos(todoList);
        handleTodoExternal({ todoList });
      }
    } else {
      const finalTodos = localTodos.map(todo =>
        todo.todoId === editingTodoId ? { ...todo, todoTxt: normalizedText } : todo
      );
      setLocalTodos(finalTodos);
      handleTodoExternal({ todoList: finalTodos });
    }
    setEditingTodoId(null);
  };

  return (
    <div className="card-todolist" onClick={e => e.stopPropagation()}>
      <div className="card-todotoggle" onClick={(e) => { e.stopPropagation(); setShowTodo(prev => !prev) }}>
        <span>할 일</span>
        <span className={`card-todotoggle arrow ${showTodo ? 'arrow--open' : ''}`}>
          <FontAwesomeIcon icon={faCaretDown} style={{ width: 16, height: 16 }} />
        </span>
      </div>
      <div className={`todo-list ${showTodo ? 'todo-list--open' : ''}`}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
        >
          <SortableContext items={localTodos.map(todo => todo.todoId)} strategy={verticalListSortingStrategy}>
            {localTodos.map(todo => (
              <DraggableTodo
                key={todo.todoId}
                todo={todo}
                isOwnerOrParticipant={isOwnerOrParticipant}
                onCompleteChange={handleTodoCompleteChange}
                onDelete={handleDeleteTodo}
                isEditing={editingTodoId === todo.todoId}
                onStartEdit={handleStartEdit}
                onTextChange={handleTodoTextChange}
                onEndEdit={handleEndEdit}
              />
            ))}
          </SortableContext>
        </DndContext>
        {isOwnerOrParticipant && (
          <div className="card-add-todo" onClick={handleAddTodo}>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="#7D8998" className="bi bi-plus-lg" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
              </svg>
            </div>
            <div className="card-add-todo__text">
              할 일 추가
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;