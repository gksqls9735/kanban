import { useRef, useState } from "react";
import { UrlData } from "../../../../types/type";
import ExpandToggle from "../../common/expand-toggle";
import FieldLabel from "./field-common/field-label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import useClickOutside from "../../../../hooks/use-click-outside";
import FieldFooter from "./field-common/field-footer";

const UrlField: React.FC<{
  urls: UrlData[];
}> = ({ urls }) => {

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const linksToShow = isExpanded ? urls : urls.slice(0, 3);
  const hiddenCount = urls.length - 3;

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  // edit-container를 참조하기 위한 ref 생성
  const editContainerRef = useRef<HTMLDivElement>(null);

  // 취소 및 창 닫기 로직
  const handleCancel = () => {
    setIsInEditMode(false);
    setIsOpenEdit(false);
  };

  // FieldLabel 클릭 핸들러 (편집 모드 토글 및 초기 상태 설정)
  const handleToggleEditMode = () => {
    if (isInEditMode) {
      handleCancel(); // 이미 편집 모드면 닫기
    } else {
      setIsInEditMode(true);
      setIsOpenEdit(false); // 편집 모드 진입 시, 기본적으로는 목록 뷰(isOpenEdit: false)로 시작
    }
  };

  useClickOutside(editContainerRef, handleCancel, isInEditMode);

  return (
    <>
      <li className="task-detail__detail-modal-field-item">
        <FieldLabel fieldName="url" onClick={handleToggleEditMode} />
        <ul className="task-detail__detail-modal-field-content-list">
          {linksToShow.map(url => {
            return (
              <li key={url.urlId} className="task-detail__detail-modal-field-value-item">
                <img src={`https://www.google.com/s2/favicons?sz=256&domain_url=${url.requestedUrl}`} className="task-detail__detail-modal-field-value-item-url-favicon" />
                <a className="truncate task-detail__detail-modal-field-value-item-url-link" href={url.requestedUrl} target="_blank" rel="noopener noreferrer">
                  {url.title}</a>
              </li>
            )
          })}
          <ExpandToggle hiddenCount={hiddenCount} toggle={() => setIsExpanded(prev => !prev)} isExpanded={isExpanded} />
        </ul>
        {isInEditMode && (
          <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
            {isOpenEdit ? (
              <>
                <div className="task-detail__detail-modal-field-edit-list-wrapper">
                  <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
                    {urls.map(url => (
                      <li key={url.urlId} className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--url-email">
                        <div className="task-detail__detail-modal-field-edit-item-drag-handle">⠿</div>
                        <div className="task-detail__detail-modal-field-edit-item-inputs">
                          <input type="text"
                            className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--first"
                            placeholder="제목을 입력하세요."
                            value={url.title}
                            onChange={() => { }}
                          />
                          <input type="text"
                            className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--second"
                            placeholder="https://"
                            onChange={() => { }}
                            value={url.requestedUrl}
                          />
                        </div>
                        <div className="todo-item__action todo-item__action--delete">
                          <FontAwesomeIcon icon={faTimes} className="task-detail__detail-modal-field-edit-item--delete" />
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="task-detail__detail-modal-field-edit-separator" />
                </div>
                <FieldFooter title="url 추가" isPlusIcon={true} onClick={() => setIsOpenEdit(prev => !prev)} handleCancel={handleCancel} isShowButton={true} />
              </>
            ) : (
              <>
                <div className="task-detail__detail-modal-field-edit-list-wrapper">
                  <ul
                    className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
                    {urls.map(url => (
                      <li key={url.urlId} className="task-detail__detail-modal-field-edit-item" style={{ alignItems: 'center'}}>
                        <img
                          src={`https://www.google.com/s2/favicons?sz=256&domain_url=${url.requestedUrl}`} className="task-detail__detail-modal-field-value-item-url-favicon" />
                        <a className="truncate task-detail__detail-modal-field-value-item-url-link" href={url.requestedUrl} target="_blank" rel="noopener noreferrer">
                          {url.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="task-detail__detail-modal-field-edit-separator" />
                </div>
                <FieldFooter title="url 수정" isPlusIcon={false} onClick={() => setIsOpenEdit(prev => !prev)} />
              </>
            )}
          </div>
        )}
      </li>
    </>
  );
};

export default UrlField;
