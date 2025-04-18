const Kanban: React.FC<{
  test: string;
}> = ({ test }) => {
  return (
    <div className='kanban'>
      {test}
    </div>
  );
};

export default Kanban;