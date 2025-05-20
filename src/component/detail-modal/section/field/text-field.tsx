import { useState } from "react";
import FieldLabel from "./field-label";

const TextField: React.FC<{ text: string }> = ({ text }) => {

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel fieldName="텍스트" onClick={() => setIsInEditMode(prev => !prev)} />
      <ul className="task-detail__detail-modal-field-content-list">
        <span className="task-detail__detail-modal-field-item--text">{text}</span>
      </ul>
      {isInEditMode && (
        <div className="task-detail__detail-modal-field-edit-container">
          편집 UI 영역 (예: "dk")
        </div>
      )}
    </li>
  );
};

export default TextField; 