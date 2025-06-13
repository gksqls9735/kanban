import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Participant, User } from "../../../types/type";
import React, { useEffect, useRef } from 'react'; // Don't forget to import React if you haven't already
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import AvatarItem from "../avatar/avatar";
import { extractFirstTeamName, extractLastTeamName, getInitial } from "../../../utils/text-function";

const UserProfile: React.FC<{
  user: Participant | User;
  onClose: () => void;
}> = ({ user, onClose }) => {

  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const el = modalContentRef.current;
      if (!el) return;
      if (el.contains(target) || (e.composedPath && e.composedPath().includes(el))) return;
      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [onClose]);

  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  const userInfo = [
    { title: '사용자 아이디', info: user.id },
    { title: '소속', info: extractFirstTeamName(user.team) },
    { title: '업무', info: extractLastTeamName(user.team) },
    { title: '연락처', info: user.phoneNumber },
    { title: '이메일', info: user.userEmail },
    { title: '소개글', info: user.tagline },
  ];

  return (
    <div ref={modalContentRef} onClick={handleModalContentClick} className="user-profile kanban-scrollbar-y">
      {/** 헤더 */}
      <div className="user-profile__header">
        <div className="user-profile__header-title">내 정보</div>
        <div onClick={onClose} className="user-profile__close-button">
          <FontAwesomeIcon icon={faTimes} />
        </div>
      </div>

      {/** 바디 */}
      <div className="user-profile__body">
        <div className="user-profile__info-section">
          <AvatarItem key={user.id} size={100} src={user.icon}>{getInitial(user.username)}</AvatarItem>
          <div>
            <div className="user-profile__username">{user.username}</div>
            <div className="user-profile__team">{extractLastTeamName(user.team)}</div>
          </div>
        </div>
        <div className="user-profile__details-list kanban-scrollbar-y">
          <ul>
            {userInfo.map((item, index) => (
              <li key={`user-info-${index}`} className="user-profile__details-item">
                <p className="user-profile__details-item-title">{item.title}</p>
                <p className={`user-profile__details-item-info ${!item.info ? 'user-profile__details-item-info--missing' : ''}`}>
                  {`${item.info ? item.info : `${item.title} 정보가 없습니다.`}`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;