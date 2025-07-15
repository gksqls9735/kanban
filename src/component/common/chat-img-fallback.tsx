import { useState } from "react";
import { FileAttachment } from "../../types/type";

const ChatImgFallback: React.FC<{ attachment: FileAttachment }> = ({ attachment }) => {
  const [hasError, setHasError] = useState(false);

  // 이미지 로딩 실패 시 hasError 상태를 true로 변경하는 핸들러
  const handleLoadError = () => {
    setHasError(true);
  };

  return (
    <img
      src={attachment.fileUrl}
      alt={attachment.fileName}
      // 📌 에러 발생 시 'image-error' 클래스를 추가합니다.
      className={`task-detail__detail-modal-chat-image-preview ${hasError ? 'image-error' : ''}`}
      onError={handleLoadError}
      style={{
        width: '150px', // 예시 크기
        height: '150px',
        objectFit: 'cover',
      }}
    />
  );
};

export default ChatImgFallback;
