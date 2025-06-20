import useDropdown from "../../../../../hooks/use-dropdown";

const ChatDropdownMenu: React.FC<{
  onEdit: () => void
  onDelete: () => void;
}> = ({ onEdit, onDelete }) => {
  const { isOpen, wrapperRef, dropdownRef, toggle } = useDropdown();

  return (
    <div className="relative">
      <div ref={wrapperRef} onClick={toggle} style={{cursor: 'pointer'}}>
        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#414D5C">
          <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
        </svg>
      </div>
      {isOpen && (
        <div ref={dropdownRef} className="select-dropdown-panel" style={{ width: 100, left: -90 }}>
          <div className="select-dropdown-item comment-dropdown-item" onClick={onEdit}>댓글 수정</div>
          <div className="select-dropdown-item comment-dropdown-item" onClick={onDelete}>댓글 삭제</div>
        </div>
      )}
    </div>
  );
};

export default ChatDropdownMenu;