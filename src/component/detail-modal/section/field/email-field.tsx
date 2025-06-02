import { useEffect, useRef, useState } from "react";
import { Email, Task } from "../../../../types/type";
import FieldLabel from "./field-common/field-label";
import useClickOutside from "../../../../hooks/use-click-outside";
import FieldFooter from "./field-common/field-footer";
import { generateUniqueId } from "../../../../utils/text-function";
import { isValidEmailFormat } from "../../../../utils/valid-function";
import UrlEmailEditableList from "./field-common/url-email-editable-list";

interface CombinedEmailItem {
  id: string | number;
  nickname: string;
  email: string;
  isNew: boolean;
}
const EmailField: React.FC<{
  emails?: Email[], isOwnerOrParticipant: boolean, handleChangeAndNotify: (updates: Partial<Task>) => void
}> = ({ emails: initialEmails = [], isOwnerOrParticipant, handleChangeAndNotify }) => {

  const [combinedItems, setCombinedItems] = useState<CombinedEmailItem[]>([]);
  const [errors, setErrors] = useState<Record<string | number, string[]>>({});

  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);

  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialCombined: CombinedEmailItem[] = initialEmails.map(e => ({
      id: e.id, nickname: e.nickname, email: e.email, isNew: false,
    }));
    setCombinedItems(initialCombined);
    setErrors({});
  }, [initialEmails]);

  const handleCopyEmail = (emailAddress: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(emailAddress);
  };

  const handleGlobalCancel = () => {
    setIsInEditMode(false);
    setIsOpenEdit(false);
    const initialCombined: CombinedEmailItem[] = initialEmails.map(e => ({
      id: e.id, nickname: e.nickname, email: e.email, isNew: false,
    }));
    setCombinedItems(initialCombined);
    setErrors({});
  };

  const handleToggleEditMode = () => {
    if (isInEditMode) {
      handleGlobalCancel();
    } else {
      setIsInEditMode(true);
      setIsOpenEdit(false);
      const currentCombined: CombinedEmailItem[] = initialEmails.map(e => ({
        id: e.id, nickname: e.nickname, email: e.email, isNew: false,
      }));
      setCombinedItems(currentCombined);
      setErrors({});
    }
  };

  useClickOutside(editContainerRef, handleGlobalCancel, isInEditMode);

  const handleUpdateEmail = (id: string | number, field: string, value: string) => {
    setCombinedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: [] }));
  };

  const handleDeleteEmail = (id: string | number) => {
    setCombinedItems(prev => prev.filter(item => item.id !== id));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleAddNewEmailForm = () => {
    const tempId = generateUniqueId('new-email');
    const newFormItem: CombinedEmailItem = {
      id: tempId, nickname: "", email: "", isNew: true,
    };
    setCombinedItems(prev => [...prev, newFormItem]);
  };


  const handleOrderChange = (newOrderedItems: CombinedEmailItem[]) => {
    setCombinedItems(newOrderedItems);
  };


  const handleGlobalSave = () => {
    const currentValidationErrors: Record<string | number, string[]> = {};
    let hasAnyError = false;

    // 이메일 주소별 카운트 (중복 검사용)
    const emailAddressCounts: Record<string, number> = {};
    combinedItems.forEach(item => {
      const emailAddr = item.email.trim();
      if (emailAddr) emailAddressCounts[emailAddr] = (emailAddressCounts[emailAddr] || 0) + 1;
    });

    // 각 항목 유효성 검사
    combinedItems.forEach(item => {
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
    const finalEmailsToSave: Email[] = combinedItems
      .map((item, index) => {
        const nickname = item.nickname.trim();
        const email = item.email.trim();

        if (item.isNew) {
          if (nickname && email) {
            if (!currentValidationErrors[item.id] || currentValidationErrors[item.id].length === 0) {
              return { id: generateUniqueId('email'), nickname, email, order: index + 1 };
            }
          }
        } else {
          if (!currentValidationErrors[item.id] || currentValidationErrors[item.id].length === 0) {
            return { id: item.id as string, nickname, email, order: index + 1 };
          }
        }
        return null;
      }).filter(Boolean) as Email[];

    handleChangeAndNotify({ emails: finalEmailsToSave });

    const reinitializedCombined: CombinedEmailItem[] = finalEmailsToSave.map(e => ({
      id: e.id, nickname: e.nickname, email: e.email, isNew: false,
    }));
    setCombinedItems(reinitializedCombined);

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
        {initialEmails.length === 0 && <li className="task-detail__detail-modal-field-edit-item--no-message">표시할 이메일이 없습니다.</li>}
      </ul>
      {isInEditMode && (
        <div ref={editContainerRef} className="task-detail__detail-modal-field-edit-container">
          {isOpenEdit ? (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <UrlEmailEditableList<CombinedEmailItem>
                  items={combinedItems}
                  itemIdKey="id"
                  itemValue1Key="nickname"
                  itemValue2Key="email"
                  onUpdateItem={handleUpdateEmail}
                  onDeleteItem={handleDeleteEmail}
                  onOrderChange={handleOrderChange}
                  placeholder1="이름을 입력하세요."
                  placeholder2="@mail.bizbee.ne.kr"
                  errors={errors}
                  noItemsMsg="표시할 이메일이 없습니다."
                />
                <div className="task-detail__detail-modal-field-edit-separator" />
              </div>
              <FieldFooter title="이메일 추가" isPlusIcon={true} onClick={handleAddNewEmailForm} handleCancel={handleGlobalCancel} isShowButton={true} onSave={handleGlobalSave} />
            </>
          ) : (
            <>
              <div className="task-detail__detail-modal-field-edit-list-wrapper">
                <ul
                  className="gantt-scrollbar-y task-detail__detail-modal-field-edit-list">
                  {initialEmails.map(email => (
                    <li key={email.id} className="task-detail__detail-modal-field-edit-item task-detail__detail-modal-field-edit-item--email">
                      <div className="task-detail__detail-modal-field-edit-item--email--nickname">{email.nickname}</div>
                      <div className="task-detail__detail-modal-field-edit-item-email--email">{email.email}</div>
                    </li>
                  ))}
                  {initialEmails.length === 0 && <li className="task-detail__detail-modal-field-edit-item--no-message">표시할 이메일이 없습니다.</li>}
                </ul>
                {isOwnerOrParticipant && (<div className="task-detail__detail-modal-field-edit-separator" />)}
              </div>
              {isOwnerOrParticipant && (<FieldFooter title="이메일 수정" isPlusIcon={false} onClick={() => { setIsOpenEdit(true); setErrors({}); }} />)}
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default EmailField;
