const TextField: React.FC<{ text: string }> = ({ text }) => {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 80, fontSize: 13, fontWeight: 500, flexShrink: 0 }}>텍스트</div>
      <ul style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '130%', letterSpacing: '0%' }}>{text}</span>
      </ul>
    </li>
  );
};

export default TextField; 