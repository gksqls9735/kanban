import { useEffect, useRef, useState } from "react";
import { UrlData } from "../../../../types/type";
import ExpandToggle from "../../common/expand-toggle";
import FieldLabel from "./field-common/field-label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import useClickOutside from "../../../../hooks/use-click-outside";
import FieldFooter from "./field-common/field-footer";
import useTaskStore from "../../../../store/task-store";
import { generateUniqueId } from "../../../../utils/text-function";
import { isValidUrlFormat } from "../../../../utils/valid-function";
import ImgFallback from "./field-common/img-fallback";

interface NewUrlForm {
  tempId: string;
  title: string;
  requestedUrl: string;
}

const FallbackIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#9ca3af">
    <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z" />
  </svg>
);

const UrlField: React.FC<{ urls: UrlData[], taskId: string }> = ({ urls: initialUrls, taskId }) => {
  const updateTask = useTaskStore(state => state.updateTask);

  const [urls, setUrls] = useState<UrlData[]>(initialUrls);
  const [errors, setErrors] = useState<Record<string | number, string[]>>({});

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const linksToShow = isExpanded ? initialUrls : initialUrls.slice(0, 3);
  const hiddenCount = initialUrls.length - 3;

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  const [newUrlForms, setNewUrlForms] = useState<NewUrlForm[]>([]);

  // edit-container를 참조하기 위한 ref 생성
  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrls(initialUrls);
    setNewUrlForms([]);
    setErrors({});
  }, [initialUrls]);

  const handleGlobalCancel = () => {
    setIsInEditMode(false);
    setIsOpenEdit(false);
    setNewUrlForms([]);
    setUrls(initialUrls);
    setErrors({});
  };

  const handleToggleEditMode = () => {
    if (isInEditMode) {
      handleGlobalCancel();
    } else {
      setIsInEditMode(true);
      setIsOpenEdit(false);
      setNewUrlForms([]);
      setUrls(initialUrls);
      setErrors({});
    }
  };

  useClickOutside(editContainerRef, handleGlobalCancel, isInEditMode);

  const handleUpdateExistingUrl = (id: string | number, field: 'title' | "requestedUrl", value: string) => {
    setUrls(prev => prev.map(u => (u.urlId === id ? { ...u, [field]: value } : u)));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: [] }));
  };

  const handleDeleteUrl = (id: string | number) => {
    setUrls(prev => prev.filter(u => u.urlId !== id));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleAddNewUrlForm = () => {
    setNewUrlForms(prev => [
      ...prev, { tempId: generateUniqueId('new-url'), title: "", requestedUrl: "" }
    ]);
  };

  const handleUpdateNewUrlForm = (tempId: string, field: 'title' | "requestedUrl", value: string) => {
    setNewUrlForms(prev =>
      prev.map(form => form.tempId === tempId ? { ...form, [field]: value } : form)
    );
    if (errors[tempId]) setErrors(prev => ({ ...prev, [tempId]: [] }));
  };

  const handleRemoveNewUrlForm = (tempId: string) => {
    setNewUrlForms(prev => prev.filter(form => form.tempId !== tempId));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[tempId];
      return newErrors;
    });
  };

  const handleGlobalSave = () => {
    const currentValidationErrors: Record<string | number, string[]> = {};
    let hasAnyError = false;

    // 유효성 검사를 위한 전체 url 목록 준비
    const validationList: Array<{ id: string | number; title: string; requestedUrl: string }> = [
      ...urls.map(u => ({ id: u.urlId, title: u.title, requestedUrl: u.requestedUrl })),
      ...newUrlForms.map(form => ({ id: form.tempId, title: form.title, requestedUrl: form.requestedUrl })),
    ];

    // url 주소별 카운트 (중복 검사용)
    const urlRequestedUrlCounts: Record<string, number> = {};
    validationList.forEach(item => {
      const rUrl = item.requestedUrl.trim();
      if (rUrl) urlRequestedUrlCounts[rUrl] = (urlRequestedUrlCounts[rUrl] || 0) + 1;
    });

    // 각 항목 유효성 검사
    validationList.forEach(item => {
      const itemId = item.id;
      const itemRUrl = item.requestedUrl.trim();
      const itemTitle = item.title.trim();
      const currentItemErrors: string[] = [];

      const isNewFormEntry = newUrlForms.some(form => form.tempId === itemId);
      if (isNewFormEntry) {
        if ((itemTitle || itemRUrl) && (!itemTitle || !itemRUrl)) {
          currentItemErrors.push('새 URL의 이름과 주소를 모두 입력해주세요.');
          hasAnyError = true;
        }
      }

      if (itemRUrl) {
        if (!isValidUrlFormat(itemRUrl)) {
          currentItemErrors.push('URL은 https://가 포함 되어야 합니다.');
          hasAnyError = true;
        }
        if (urlRequestedUrlCounts[itemRUrl] > 1) {
          currentItemErrors.push('URL명이 동일합니다.');
          hasAnyError = true;
        }
      } else if (!isNewFormEntry && !itemRUrl && itemTitle) {
        currentItemErrors.push('URL을 입력해주세요.');
      }

      if (currentItemErrors.length > 0) currentValidationErrors[itemId] = currentItemErrors;
    });

    setErrors(currentValidationErrors);

    if (hasAnyError) return;

    let finalUrlsToSave = [...urls];

    newUrlForms.forEach(form => {
      const trimmedUrlTitle = form.title.trim();
      const trimmedUrlRequestedUrl = form.requestedUrl.trim();

      if (trimmedUrlTitle && trimmedUrlRequestedUrl) {
        if (!currentValidationErrors[form.tempId] || currentValidationErrors[form.tempId].length === 0) {
          finalUrlsToSave.push({
            urlId: generateUniqueId('url'),
            title: trimmedUrlTitle,
            requestedUrl: trimmedUrlRequestedUrl,
            order: finalUrlsToSave.length + 1,
          });
        }
      }
    });

    updateTask(taskId, { urls: finalUrlsToSave });

    setNewUrlForms([]);
    setIsOpenEdit(false);
    setIsInEditMode(false);
    setErrors({});
  };

  return (
    <>
      <li className="task-detail__detail-modal-field-item">
        <FieldLabel fieldName="url" onClick={handleToggleEditMode} />
        <ul className="task-detail__detail-modal-field-content-list">
          {linksToShow.map(url => {
            return (
              <li key={url.urlId} className="task-detail__detail-modal-field-value-item">
                <ImgFallback src={`https://www.google.com/s2/favicons?sz=256&domain_url=${url.requestedUrl}`} fallback={FallbackIcon} />
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
                            onChange={(e) => handleUpdateExistingUrl(url.urlId, 'title', e.target.value)}
                          />
                          <div className="task-detail__detail-modal-field-edit-input-wrapper">
                            <input type="text"
                              className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--second"
                              placeholder="https://"
                              value={url.requestedUrl}
                              onChange={(e) => { handleUpdateExistingUrl(url.urlId, 'requestedUrl', e.target.value) }}
                              style={{ borderColor: `${errors[url.urlId] && errors[url.urlId].length > 0 ? '#F04438' : ''}` }}
                            />
                            {errors[url.urlId] && errors[url.urlId].length > 0 && (
                              <div className="task-detail__detail-modal-field-edit-error-message">
                                {errors[url.urlId].join(' ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="todo-item__action todo-item__action--delete" onClick={() => handleDeleteUrl(url.urlId)}>
                          <FontAwesomeIcon icon={faTimes} className="task-detail__detail-modal-field-edit-item--delete" />
                        </div>
                      </li>
                    ))}
                    {newUrlForms.map((url, index) => (
                      <li key={url.tempId} className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--url-email">
                        <div className="task-detail__detail-modal-field-edit-item-drag-handle">⠿</div>
                        <div className="task-detail__detail-modal-field-edit-item-inputs">
                          <input type="text"
                            className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--first"
                            placeholder="제목을 입력하세요."
                            value={url.title}
                            onChange={(e) => handleUpdateNewUrlForm(url.tempId, 'title', e.target.value)}
                            autoFocus={index === newUrlForms.length - 1}
                          />
                          <div className="task-detail__detail-modal-field-edit-input-wrapper">
                            <input type="text"
                              className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--second"
                              placeholder="https://"
                              value={url.requestedUrl}
                              onChange={(e) => { handleUpdateNewUrlForm(url.tempId, 'requestedUrl', e.target.value) }}
                              style={{ borderColor: `${errors[url.tempId] && errors[url.tempId].length > 0 ? '#F04438' : ''}` }}
                            />
                            {errors[url.tempId] && errors[url.tempId].length > 0 && (
                              <div className="task-detail__detail-modal-field-edit-error-message">
                                {errors[url.tempId].join(' ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="todo-item__action todo-item__action--delete" onClick={() => handleRemoveNewUrlForm(url.tempId)}>
                          <FontAwesomeIcon icon={faTimes} className="task-detail__detail-modal-field-edit-item--delete" />
                        </div>
                      </li>
                    ))}
                    {urls.length === 0 && newUrlForms.length === 0 && <li className="task-detail__detail-modal-field-edit-item--no-message">표시할 URL이 없습니다.</li>}
                  </ul>
                  <div className="task-detail__detail-modal-field-edit-separator" />
                </div>
                <FieldFooter title="url 추가" isPlusIcon={true} onClick={handleAddNewUrlForm} handleCancel={handleGlobalCancel} isShowButton={true} onSave={handleGlobalSave} />
              </>
            ) : (
              <>
                <div className="task-detail__detail-modal-field-edit-list-wrapper">
                  <ul
                    className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
                    {urls.map(url => (
                      <li key={url.urlId} className="task-detail__detail-modal-field-edit-item" style={{ alignItems: 'center' }}>
                        <ImgFallback src={`https://www.google.com/s2/favicons?sz=256&domain_url=${url.requestedUrl}`} fallback={FallbackIcon} />
                        <a className="truncate task-detail__detail-modal-field-value-item-url-link" href={url.requestedUrl} target="_blank" rel="noopener noreferrer">
                          {url.title}
                        </a>
                      </li>
                    ))}
                    {urls.length === 0 && <li className="task-detail__detail-modal-field-edit-item--no-message">표시할 URL이 없습니다.</li>}
                  </ul>
                  <div className="task-detail__detail-modal-field-edit-separator" />
                </div>
                <FieldFooter title="url 수정" isPlusIcon={false} onClick={() => { setIsOpenEdit(true); setErrors({}); }} />
              </>
            )}
          </div>
        )}
      </li>
    </>
  );
};

export default UrlField;
