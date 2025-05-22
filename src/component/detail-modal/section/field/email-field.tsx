import { useEffect, useRef, useState } from "react";
import { Email } from "../../../../types/type";
import FieldLabel from "./field-common/field-label";
import useClickOutside from "../../../../hooks/use-click-outside";
import FieldFooter from "./field-common/field-footer";
import { generateUniqueId } from "../../../../utils/text-function";
import { isValidEmailFormat } from "../../../../utils/valid-function";
import useTaskStore from "../../../../store/task-store";
import UrlEmailEditableList from "./field-common/url-email-editable-list";

interface NewEmailForm {
  tempId: string | number;
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

  const handleUpdateExistingEmail = (id: string | number, field: string, value: string) => {
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

  const handleUpdateNewEmailForm = (tempId: string | number, field: string, value: string) => {
    setNewEmailForms(prevForms =>
      prevForms.map(form => form.tempId === tempId ? { ...form, [field]: value } : form)
    );
    if (errors[tempId]) setErrors(prev => ({ ...prev, [tempId]: [] }));
  };

  const handleRemoveNewEmailForm = (tempId: string | number) => {
    setNewEmailForms(prevForms => prevForms.filter(form => form.tempId !== tempId));
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[tempId];
      return newErrors;
    });
  };

  const handleOrderChange = (newOrderedEmails: Email[], newOrderedNewEmailForms: NewEmailForm[]) => {
    setEmails(newOrderedEmails);
    setNewEmailForms(newOrderedNewEmailForms);
  };


  const handleGlobalSave = () => {
    const currentValidationErrors: Record<string | number, string[]> = {};
    let hasAnyError = false;

    // 유효성 검사를 위한 전체 이메일 목록 준비
    const validationList: Array<{ id: string | number; nickname: string; email: string, isNew: boolean }> = [
      ...emails.map(e => ({ id: e.id, nickname: e.nickname, email: e.email, isNew: false })),
      ...newEmailForms.map(form => ({ id: form.tempId, nickname: form.nickname, email: form.email, isNew: true }))
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
      const currentItemErrors: string[] = [];

      if (item.isNew) {
        if ((itemNickname || itemEmail) && (!itemNickname || !itemEmail)) {
          currentItemErrors.push('새 이메일의 이름과 주소를 모두 입력해주세요.');
          hasAnyError = true;
        }
      }

      // 이메일 필드가 비어있지 않은 경우에만 형식 및 중복 검사
      if (itemEmail) {
        if (!isValidEmailFormat(itemEmail)) {
          currentItemErrors.push('이메일 형식이 맞지 않습니다.');
          hasAnyError = true;
        }
        if (emailAddressCounts[itemEmail] > 1) {
          currentItemErrors.push("이메일이 동일합니다.");
          hasAnyError = true;
        }
      } else if (!item.isNew && !itemEmail && itemNickname) {
        currentItemErrors.push("이메일 주소를 입력해주세요");
      } else if (!item.isNew && itemEmail && !itemNickname) {
        if (!currentItemErrors.includes('새 이메일의 이름과 주소를 모두 입력해주세요.')) {
          currentItemErrors.push('새 이메일의 주소를 입력해주세요.');
          hasAnyError = true;
        }
      }

      if (currentItemErrors.length > 0) currentValidationErrors[itemId] = currentItemErrors;
    });

    setErrors(currentValidationErrors);

    if (hasAnyError) return;

    // 에러가 없을 시 실제 저장 로직 진행
    const finalEmailsToSave: Email[] = [];
    let orderCounter = 1;

    emails.forEach(e => {
      finalEmailsToSave.push({ ...e, order: orderCounter++ })
    });

    newEmailForms.forEach(form => {
      const trimmedNickname = form.nickname.trim();
      const trimmedEmailAddress = form.email.trim();

      if (trimmedNickname && trimmedEmailAddress) {
        if (!currentValidationErrors[form.tempId] || currentValidationErrors[form.tempId].length === 0) {
          finalEmailsToSave.push({
            id: generateUniqueId('email'),
            nickname: trimmedNickname,
            email: trimmedEmailAddress,
            order: orderCounter++,
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
                <UrlEmailEditableList<Email, NewEmailForm>
                  existingItems={emails}
                  existingItemIdKey="id"
                  existingItemValue1Key="nickname"
                  existingItemValue2Key="email"
                  onUpdateExistingItem={handleUpdateExistingEmail}
                  onDeleteExistingItem={handleDeleteEmail}

                  newForms={newEmailForms}
                  newFormTempIdKey="tempId"
                  newFormValue1Key="nickname"
                  newFormValue2Key="email"
                  onUpdateNewForm={handleUpdateNewEmailForm}
                  onRemoveNewForm={handleRemoveNewEmailForm}

                  placeholder1="이름을 입력하세요."
                  placeholder2="@mail.bizbee.ne.kr"
                  errors={errors}
                  noItemsMsg="표시할 이메일이 없습니다."

                  onOrderChange={handleOrderChange}
                />
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
