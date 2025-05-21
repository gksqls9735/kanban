import { useEffect, useRef, useState } from "react";
import { Email } from "../../../../types/type";
import FieldLabel from "./field-common/field-label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import useClickOutside from "../../../../hooks/use-click-outside";
import FieldFooter from "./field-common/field-footer";
import { generateUniqueId } from "../../../../utils/text-function";
import { isValidEmailFormat } from "../../../../utils/valid-function";
import useTaskStore from "../../../../store/task-store";

const NEW_INLINE_EMAIL_KEY = 'new_inline_email_validator_key';

const EmailField: React.FC<{ emails: Email[], taskId: string }> = ({ emails: initialEmails, taskId }) => {
  const updateTask = useTaskStore(state => state.updateTask);

  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [errors, setErrors] = useState<Record<string | number, string[]>>({});

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  const [showInlineAddRow, setShowInlineAddRow] = useState<boolean>(false);
  const [newInlineNickname, setNewInlineNickname] = useState<string>("");
  const [newInlineEmailAddress, setNewInlineEmailAddress] = useState<string>("");

  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEmails(initialEmails);
  }, [initialEmails]);

  const handleCopyEmail = (emailAddress: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(emailAddress);
  };

  const handleGlobalCancel = () => {
    setIsInEditMode(false);
    setIsOpenEdit(false);
    setShowInlineAddRow(false);
    setNewInlineNickname("");
    setNewInlineEmailAddress("");
    setEmails(initialEmails);
    setErrors({});
  };

  const handleToggleEditMode = () => {
    if (isInEditMode) {
      handleGlobalCancel();
    } else {
      setIsInEditMode(true);
      setIsOpenEdit(false);
      setShowInlineAddRow(false);
      setNewInlineNickname("");
      setNewInlineEmailAddress("");
      setEmails(initialEmails);
      setErrors({});
    }
  };

  useClickOutside(editContainerRef, handleGlobalCancel, isInEditMode);

  const handleUpdateExistingEmail = (id: string | number, field: 'nickname' | 'email', value: string) => {
    setEmails(prevEmails =>
      prevEmails.map(e => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleDeleteEmail = (id: string | number) => {
    setEmails(prevEmails => prevEmails.filter(e => e.id !== id));
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleToggleShowInlineAddForm = () => {
    const newShowState = !showInlineAddRow;
    setShowInlineAddRow(newShowState);
    if (newShowState) {
      setNewInlineNickname("");
      setNewInlineEmailAddress("");
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[NEW_INLINE_EMAIL_KEY];
        return newErrors;
      });
    }
  };

  const handleRemoveInlineAddRow = () => {
    setShowInlineAddRow(false);
    setNewInlineNickname("");
    setNewInlineEmailAddress("");
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[NEW_INLINE_EMAIL_KEY];
      return newErrors;
    });
  };

  const handleGlobalSave = () => {
    const currentValidationErrors: Record<string | number, string[]> = {};
    let hasAnyError = false;

    const validationList: Array<{ id: string | number; nickname: string; email: string }> =
      emails.map(e => ({ id: e.id, nickname: e.nickname, email: e.email }));

    // 유효성 검사를 위한 전체 이메일 목록 준비 (기존 + 신규)
    if (showInlineAddRow) {
      const trimmedNickname = newInlineNickname.trim();
      const trimmedEmailAddress = newInlineEmailAddress.trim();

      if (trimmedNickname || trimmedEmailAddress) {
        validationList.push({
          id: NEW_INLINE_EMAIL_KEY,
          nickname: trimmedNickname,
          email: trimmedEmailAddress,
        });
      }
    }

    // 이메일 주소별 카운트 (중복 검사용)
    const emailAddressCounts: Record<string, number> = {};
    validationList.forEach(item => {
      const emailAddr = item.email.trim();
      if (emailAddr) emailAddressCounts[emailAddr] = (emailAddressCounts[emailAddr] || 0) + 1;
    });

    // 각 항목 유효성 검사
    validationList.forEach(item => {
      const itemId = item.id;
      const itemEmail = item.email.trim();
      const itemNickname = item.nickname.trim();
      const currentItemErrors: string[] = [];

      // 새 이메일 추가 행에 대한 필수 필드 검사사
      if (itemId === NEW_INLINE_EMAIL_KEY) {
        if (!itemNickname || !itemEmail) {
          currentItemErrors.push("새 이메일의 이름과 주소를 모두 입력해주세요.");
          hasAnyError = true;
        }
      }

      // 이메일 필드가 비어있지 않은 경우에만 형식 및 중복 검사
      if (itemEmail) {
        if (!isValidEmailFormat(itemEmail)) {
          currentItemErrors.push("이메일 형식이 맞지 않습니다.");
          hasAnyError = true;
        }
        if (emailAddressCounts[itemEmail] > 1) {
          currentItemErrors.push("이메일이 동일합니다.");
          hasAnyError = true;
        }
      } else if (itemId !== NEW_INLINE_EMAIL_KEY && !itemEmail) {
        // 기존 이메일인데 이메일 주소가 비워진 경우 (닉네임만 남음)
        // (정책에 따라) 에러로 처리할 수 있음. 여기서는 '이름과 주소를 모두 입력' 규칙은 새 항목에만 적용.
        // 필요하다면 여기에 "이메일 주소를 입력해주세요." 추가 가능
      }

      if (currentItemErrors.length > 0) {
        currentValidationErrors[itemId] = currentItemErrors;
      }
    });

    setErrors(currentValidationErrors);

    if (hasAnyError) return;

    // 에러가 없으면 실제 저장 로직 진행
    let finalEmailsToSave = [...emails];

    if (showInlineAddRow) {
      const trimmedNickname = newInlineEmailAddress.trim();
      const trimmedEmailAddress = newInlineEmailAddress.trim();

      if (trimmedNickname && trimmedEmailAddress) {
        const newEmailToAdd: Email = {
          id: generateUniqueId('email'),
          nickname: trimmedNickname,
          email: trimmedEmailAddress,
          order: finalEmailsToSave.length + 1,
        };
        finalEmailsToSave.push(newEmailToAdd);
      }
    }

    updateTask(taskId, { emails: finalEmailsToSave });

    setShowInlineAddRow(false);
    setNewInlineNickname("");
    setNewInlineEmailAddress("");
    setIsOpenEdit(false);
    setIsInEditMode(false);
    setErrors({});
  };

  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel fieldName="이메일" onClick={handleToggleEditMode} />
      <ul className="task-detail__detail-modal-field-content-list">
        {initialEmails.map(email => (
          <li key={email.id} onClick={() => handleCopyEmail(email.email)}
            className="task-detail__detail-modal-field-value-item task-detail__detail-modal-field-item--email">
            {email.nickname}
          </li>
        ))}
        {initialEmails.length === 0 && <li className="task-detail__detail-modal-field-value-item--empty">이메일 없음</li>}
      </ul>
      {isInEditMode && (
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          {isOpenEdit ? (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <ul className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
                  {emails.map(email => (
                    <li key={email.id} className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--url-email" style={{ alignItems: 'baseline' }}>
                      <div className="task-detail__detail-modal-field-edit-item-drag-handle">⠿</div>
                      <div className="task-detail__detail-modal-field-edit-item-inputs">
                        <input type="text"
                          className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--first"
                          placeholder="이름을 입력하세요."
                          defaultValue={email.nickname}
                          onChange={(e) => handleUpdateExistingEmail(email.id, 'nickname', e.target.value)}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                          <input type="text"
                            className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--second"
                            placeholder="@mail.bizbee.ne.kr"
                            value={email.email}
                            onChange={(e) => handleUpdateExistingEmail(email.id, 'email', e.target.value)}
                            style={{ borderColor: `${errors[email.id] && errors[email.id].length > 0 ? '#F04438' : ''}` }}
                          />
                          {errors[email.id] && errors[email.id].length > 0 && (
                            <div style={{ fontWeight: 400, fontSize: 12, color: '#F04438' }}>
                              {errors[email.id].join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="todo-item__action todo-item__action--delete" onClick={() => handleDeleteEmail(email.id)}>
                        <FontAwesomeIcon icon={faTimes} className="task-detail__detail-modal-field-edit-item--delete" />
                      </div>
                    </li>
                  ))}
                  {showInlineAddRow && (
                    <li className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--url-email" style={{ alignItems: 'baseline' }}>
                      <div className="task-detail__detail-modal-field-edit-item-drag-handle">⠿</div>
                      <div className="task-detail__detail-modal-field-edit-item-inputs">
                        <input type="text"
                          className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--first"
                          placeholder="이름을 입력하세요."
                          value={newInlineNickname}
                          onChange={(e) => setNewInlineNickname(e.target.value)}
                          autoFocus
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <input type="text"
                            className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--second"
                            placeholder="@mail.bizbee.ne.kr"
                            value={newInlineEmailAddress}
                            onChange={(e) => setNewInlineEmailAddress(e.target.value)}
                            style={{ borderColor: `${errors[NEW_INLINE_EMAIL_KEY] && errors[NEW_INLINE_EMAIL_KEY].length > 0 ? '#F04438' : ''}` }}
                          />
                          {errors[NEW_INLINE_EMAIL_KEY] && errors[NEW_INLINE_EMAIL_KEY].length > 0 && (
                            <div style={{ fontWeight: 400, fontSize: 12, color: '#F04438', marginTop: '4px' }}>
                              {errors[NEW_INLINE_EMAIL_KEY].join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="todo-item__action todo-item__action--delete" onClick={handleRemoveInlineAddRow}>
                        <FontAwesomeIcon icon={faTimes} className="task-detail__detail-modal-field-edit-item--delete" />
                      </div>
                    </li>
                  )}
                </ul>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="이메일 추가" isPlusIcon={true} onClick={handleToggleShowInlineAddForm} handleCancel={handleGlobalCancel} isShowButton={true} onSave={handleGlobalSave} />
            </>
          ) : (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <ul
                  className="kanban-scrollbar-y task-detail__detail-modal-field-edit-list">
                  {emails.map(email => (
                    <li key={email.id} className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--email">
                      <div className="task-detail__detail-modal-field-edit-item--email--nickname">{email.nickname}</div>
                      <div className="task-detail__detail-modal-field-edit-item-email--email">{email.email}</div>
                    </li>
                  ))}
                  {emails.length === 0 && <li style={{ textAlign: 'center', padding: '10px' }}>표시할 이메일이 없습니다.</li>}
                </ul>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="이메일 수정" isPlusIcon={false} onClick={() => { setIsOpenEdit(true); setErrors({}); }} />
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default EmailField;
