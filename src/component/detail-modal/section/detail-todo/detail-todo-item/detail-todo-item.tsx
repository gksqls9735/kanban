import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { formatDateToKoreanDeadline } from "../../../../../utils/date-function";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DetailTodoHandler from "./detail-todo-handler";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { CombinedTodoItem } from "../detail-todo-list";

const DetailTodoItem: React.FC<{
  item: CombinedTodoItem;
  onDelete: (todoId: string) => void;
  onCompleteChange: (todoId: string) => void;
  isOwnerOrParticipant: boolean;
}> = ({ item, onDelete, onCompleteChange, isOwnerOrParticipant }) => {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.todoId, disabled: !isOwnerOrParticipant });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const checkboxId = `todo-check-${item.todoId}`;
  return (
    <li className="task-detail__detail-modal-todo-item" style={{ ...style }} ref={setNodeRef} {...attributes}>
      <DetailTodoHandler listeners={listeners} isDragging={isDragging} />
      <div className="task-detail__detail-modal-todo-item-checkbox">
        <div className="task-detail__checkbox-area">
          <input
            type="checkbox"
            className="task-detail__checkbox--native"
            id={checkboxId}
            checked={item.isCompleted}
            onChange={() => onCompleteChange(item.todoId)}
          />
          <label htmlFor={checkboxId} className="task-detail__checkbox--visual" style={{ cursor: isOwnerOrParticipant ? 'pointer' : 'default', }} />
        </div>
      </div>
      <div className="task-detail__detail-modal-todo-item-content">
        <div className={`${item.isCompleted ? 'line-through' : ''}`}>{item.todoTxt}</div>
        {item.todoDt ? (<div>{formatDateToKoreanDeadline(item.todoDt)}</div>) : (<div>기한 없음</div>)}
      </div>
      {isOwnerOrParticipant && (
        <div className="todo-item__action todo-item__action--delete" onClick={() => onDelete(item.todoId)}>
          <FontAwesomeIcon icon={faTimes} style={{ width: 12, height: 12, color: "rgba(125, 137, 152, 1)" }} />
        </div>
      )}
    </li>
  );
};

export default DetailTodoItem;