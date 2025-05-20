import { useState } from "react";
import { UrlData } from "../../../../types/type";
import ExpandToggle from "../../common/expand-toggle";
import FieldLabel from "./field-label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const UrlField: React.FC<{
  urls: UrlData[];
}> = ({ urls }) => {

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const linksToShow = isExpanded ? urls : urls.slice(0, 3);
  const hiddenCount = urls.length - 3;

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  const handleCancel = () => {
    setIsInEditMode(false);
    setIsOpenEdit(false);
  }

  return (
    <>
      <li className="task-detail__detail-modal-field-item">
        <FieldLabel fieldName="url" onClick={() => setIsInEditMode(prev => !prev)} />
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
          <div className="task-detail__detail-modal-field-edit-container">
            {isOpenEdit ? (
              <>
                <div className="task-detail__detail-modal-field-edit-list-wrapper">
                  <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-url-list">
                    {urls.map(url => (
                      <li className="task-detail__detail-modal-field-edit-url-item" style={{ gap: 12 }}>
                        <div style={{ width: 16, height: 16, color: '#D9D9D9', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>⠿</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input type="text"
                            placeholder="제목목을 입력하세요."
                            style={{ width: 128, height: 32, border: '1px solid #E4E8EE', borderRadius: 4, padding: '0px 10px', outline: 'none', color: '#8D99A8', boxSizing: 'border-box' }}
                            value={url.title}
                          />
                          <input type="text"
                            placeholder="https://"
                            style={{ width: 348, height: 32, border: '1px solid #E4E8EE', borderRadius: 4, padding: '0px 10px', outline: 'none', color: '#8D99A8', boxSizing: 'border-box' }}
                            value={url.requestedUrl}
                          />
                        </div>
                        <div className="todo-item__action todo-item__action--delete">
                          <FontAwesomeIcon icon={faTimes} style={{ width: 12, height: 12, color: "rgba(125, 137, 152, 1)" }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="task-detail__detail-modal-field-edit-separator" />
                </div>
                <div className="task-detail__detail-modal-field-edit-footer" onClick={() => setIsOpenEdit(prev => !prev)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#414D5C" className="bi bi-plus-lg" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                  </svg>
                  <span className="task-detail__detail-modal-field-edit-footer-text">url 추가</span>
                </div>
              </>
            ) : (
              <>
                <div className="task-detail__detail-modal-field-edit-list-wrapper">
                  <ul
                    className="kanban-scrollbar-y task-detail__detail-modal-field-edit-url-list">
                    {urls.map(url => (
                      <li key={url.urlId} className="task-detail__detail-modal-field-edit-url-item">
                        <img
                          style={{ width: 16, height: 16 }}
                          src={`https://www.google.com/s2/favicons?sz=256&domain_url=${url.requestedUrl}`} className="task-detail__detail-modal-field-value-item-url-favicon" />
                        <a className="truncate task-detail__detail-modal-field-value-item-url-link" href={url.requestedUrl} target="_blank" rel="noopener noreferrer">
                          {url.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="task-detail__detail-modal-field-edit-separator" />
                </div>
                <div className="task-detail__detail-modal-field-edit-footer" style={{ justifyContent: 'space-between' }}>
                  <div style={{ width: 'fit-content', display: 'flex', gap: 10, alignItems: 'center' }} onClick={() => setIsOpenEdit(prev => !prev)}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#414D5C">
                      <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                    </svg>
                    <span className="task-detail__detail-modal-field-edit-footer-text">url 수정</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 40, height: 28, fontWeight: 500, fontSize: 13, color: '#8D99A8', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={handleCancel}>취소</div>
                    <div style={{ width: 40, height: 28, fontWeight: 500, fontSize: 13, color: '#16B364', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>저장</div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </li>
    </>
  );
};

export default UrlField;