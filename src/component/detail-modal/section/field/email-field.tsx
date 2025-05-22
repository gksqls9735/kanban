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

interface NewEmailForm {
  tempId: string;
  nickname: string;
  email: string;
}

const EmailField: React.FC<{ emails: Email[], taskId: string }> = ({ emails: initialEmails, taskId }) => {
  const updateTask = useTaskStore(state => state.updateTask);

  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [errors, setErrors] = useState<Record<string | number, string[]>>({});

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  const [newEmailForms, setNewEmailForms] = useState<NewEmailForm[]>([]);

  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEmails(initialEmails);
    setNewEmailForms([]);
    setErrors({});
  }, [initialEmails]);

  const handleCopyEmail = (emailAddress: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(emailAddress);
  };

  const handleGlobalCancel = () => {
    setIsInEditMode(false);
    setIsOpenEdit(false);
    setNewEmailForms([]);
    setEmails(initialEmails);
    setErrors({});
  };

  const handleToggleEditMode = () => {
    if (isInEditMode) {
      handleGlobalCancel();
    } else {
      setIsInEditMode(true);
      setIsOpenEdit(false);
      setNewEmailForms([]);
      setEmails(initialEmails);
      setErrors({});
    }
  };

  useClickOutside(editContainerRef, handleGlobalCancel, isInEditMode);

  const handleUpdateExistingEmail = (id: string | number, field: 'nickname' | 'email', value: string) => {
    setEmails(prevEmails => prevEmails.map(e => (e.id === id ? { ...e, [field]: value } : e)));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: [] }));
  };

  const handleDeleteEmail = (id: string | number) => {
    setEmails(prevEmails => prevEmails.filter(e => e.id !== id));
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleAddNewEmailForm = () => {
    setNewEmailForms(prevForms => [
      ...prevForms, { tempId: generateUniqueId('new-email'), nickname: "", email: "" }
    ]);
  }

  const handleUpdateNewEmailForm = (tempId: string, field: 'nickname' | 'email', value: string) => {
    setNewEmailForms(prevForms =>
      prevForms.map(form => form.tempId === tempId ? { ...form, [field]: value } : form)
    );
    if (errors[tempId]) setErrors(prev => ({ ...prev, [tempId]: [] }));
  };

  const handleRemoveNewEmailForm = (tempId: string) => {
    setNewEmailForms(prevForms => prevForms.filter(form => form.tempId !== tempId));
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[tempId];
      return newErrors;
    });
  };

  const handleGlobalSave = () => {
    const currentValidationErrors: Record<string | number, string[]> = {};
    let hasAnyError = false;

    // 유효성 검사를 위한 전체 이메일 목록 준비
    const validationList: Array<{ id: string | number; nickname: string; email: string }> = [
      ...emails.map(e => ({ id: e.id, nickname: e.nickname, email: e.email })),
      ...newEmailForms.map(form => ({ id: form.tempId, nickname: form.nickname, email: form.email }))
    ];

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
      const currnetItemErrors: string[] = [];

      // 새 이메일 폼들에 대한 필수 필드 검사
      // newEmailForms에 포함된 항목인지 확인하여, 둘 다 비어있으면 에러로 처리하지 않고 무시 (저장 시 제외)
      // 둘 중 하나라고 값이 있다면 둘 다 있어야 함
      const isNewFormEntry = newEmailForms.some(form => form.tempId === itemId);
      if (isNewFormEntry) {
        if ((itemNickname || itemEmail) && (!itemNickname || !itemEmail)) {
          currnetItemErrors.push('새 이메일의 이름과 주소를 모두 입력해주세요.');
          hasAnyError = true;
        }
      }

      // 이메일 필드가 비어있지 않은 경우에만 형식 및 중복 검사
      if (itemEmail) {
        if (!isValidEmailFormat(itemEmail)) {
          currnetItemErrors.push('이메일 형식이 맞지 않습니다.');
          hasAnyError = true;
        }
        if (emailAddressCounts[itemEmail] > 1) {
          currnetItemErrors.push("이메일이 동일합니다.");
          hasAnyError = true;
        }
      } else if (!isNewFormEntry && !itemEmail && itemNickname) {
        currnetItemErrors.push("이메일 주소를 입력해주세요");
      }

      if (currnetItemErrors.length > 0) currentValidationErrors[itemId] = currnetItemErrors;
    });

    setErrors(currentValidationErrors);

    if (hasAnyError) return;

    // 에러가 없을 시 실제 저장 로직 진행
    let finalEmailsToSave = [...emails];

    newEmailForms.forEach(form => {
      const trimmedNickname = form.nickname.trim();
      const trimmedEmailAddress = form.email.trim();

      if (trimmedNickname && trimmedEmailAddress) {
        if (!currentValidationErrors[form.tempId] || currentValidationErrors[form.tempId].length === 0) {
          finalEmailsToSave.push({
            id: generateUniqueId('email'),
            nickname: trimmedNickname,
            email: trimmedEmailAddress,
            order: finalEmailsToSave.length + 1,
          });
        }
      }
    });

    updateTask(taskId, { emails: finalEmailsToSave });

    setNewEmailForms([]);
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
                          value={email.nickname}
                          onChange={(e) => handleUpdateExistingEmail(email.id, 'nickname', e.target.value)}
                        />
                        <div className="task-detail__detail-modal-field-edit-input-wrapper">
                          <input type="text"
                            className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--second"
                            placeholder="@mail.bizbee.ne.kr"
                            value={email.email}
                            onChange={(e) => handleUpdateExistingEmail(email.id, 'email', e.target.value)}
                            style={{ borderColor: `${errors[email.id] && errors[email.id].length > 0 ? '#F04438' : ''}` }}
                          />
                          {errors[email.id] && errors[email.id].length > 0 && (
                            <div className="task-detail__detail-modal-field-edit-error-message">
                              {errors[email.id].join(' ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="todo-item__action todo-item__action--delete" onClick={() => handleDeleteEmail(email.id)}>
                        <FontAwesomeIcon icon={faTimes} className="task-detail__detail-modal-field-edit-item--delete" />
                      </div>
                    </li>
                  ))}
                  {newEmailForms.map((form, index) => (
                    <li key={form.tempId} className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--url-email" style={{ alignItems: 'baseline' }}>
                      <div className="task-detail__detail-modal-field-edit-item-drag-handle">⠿</div>
                      <div className="task-detail__detail-modal-field-edit-item-inputs">
                        <input type="text"
                          className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--first"
                          placeholder="이름을 입력하세요."
                          defaultValue={form.nickname}
                          onChange={(e) => handleUpdateNewEmailForm(form.tempId, 'nickname', e.target.value)}
                          autoFocus={index === newEmailForms.length - 1}
                        />
                        <div className="task-detail__detail-modal-field-edit-input-wrapper">
                          <input type="text"
                            className="task-detail__detail-modal-field-edit-input task-detail__detail-modal-field-edit-input--second"
                            placeholder="@mail.bizbee.ne.kr"
                            value={form.email}
                            onChange={(e) => handleUpdateNewEmailForm(form.tempId, 'email', e.target.value)}
                            style={{ borderColor: `${errors[form.tempId] && errors[form.tempId].length > 0 ? '#F04438' : ''}` }}
                          />
                          {errors[form.tempId] && errors[form.tempId].length > 0 && (
                            <div className="task-detail__detail-modal-field-edit-error-message">
                              {errors[form.tempId].join(' ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="todo-item__action todo-item__action--delete" onClick={() => handleRemoveNewEmailForm(form.tempId)}>
                        <FontAwesomeIcon icon={faTimes} className="task-detail__detail-modal-field-edit-item--delete" />
                      </div>
                    </li>
                  ))}
                  {emails.length === 0 && newEmailForms.length === 0 && <li className="task-detail__detail-modal-field-edit-item--no-message">표시할 이메일이 없습니다.</li>}
                </ul>
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="이메일 추가" isPlusIcon={true} onClick={handleAddNewEmailForm} handleCancel={handleGlobalCancel} isShowButton={true} onSave={handleGlobalSave} />
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
                  {emails.length === 0 && <li className="task-detail__detail-modal-field-edit-item--no-message">표시할 이메일이 없습니다.</li>}
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
