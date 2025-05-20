import { Email } from "../../../../types/type";
import FieldLabel from "./field-label";

const EmailField: React.FC<{ emails: Email[] }> = ({ emails }) => {

  const handleCopyEmail = (emailAddress: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(emailAddress)
  };

  return (
    <li className="task-detail__detail-modal-field-item">
      <FieldLabel fieldName="이메일"/>
      <ul className="task-detail__detail-modal-field-content-list">
        {emails.map(email => (
          <li key={email.id} onClick={() => handleCopyEmail(email.email)}
            className="task-detail__detail-modal-field-value-item task-detail__detail-modal-field-item--email">
            {email.nickname}
          </li>
        ))}
      </ul>
    </li>
  );
};

export default EmailField;