import { Email } from "../../../../types/type";

const EmailField: React.FC<{ emails: Email[] }> = ({ emails }) => {

  const handleCopyEmail = (emailAddress: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(emailAddress)
  };

  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 80, fontSize: 13, fontWeight: 500, flexShrink: 0 }}>이메일</div>
      <ul style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {emails.map(email => (
          <li key={email.id} onClick={() => handleCopyEmail(email.email)}
            style={{
              height: 24, maxWidth: 160, padding: '4px 6px',
              display: 'flex', gap: 4, alignItems: 'center',
              border: '1px solid #E4E8EE', borderRadius: 4, boxSizing: 'border-box',
              fontSize: 13, fontWeight: 400, textDecoration: 'underline', cursor: 'copy'
            }}>
            {email.nickname}
          </li>
        ))}
      </ul>
    </li>
  );
};

export default EmailField;