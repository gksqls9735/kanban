const IdField: React.FC<{ prefix: string, taskId: string }> = ({ prefix, taskId }) => {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 80, fontSize: 13, fontWeight: 500, flexShrink: 0 }}>ID</div>
      <ul style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <li style={{ fontSize: 13, fontWeight: 400 }}>{`${prefix}-${taskId}`}</li>
      </ul>
    </li>
  );
};

export default IdField;