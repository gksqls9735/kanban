import React, { useEffect, useState } from "react";

const ImgFallback: React.FC<{
  src: string,
  fallback: any,
  alt?: string
}> = ({ src, fallback, alt = "" }) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => setHasError(true)

  if (hasError || !imgSrc) {
    if (React.isValidElement(fallback)) return React.cloneElement(fallback);
    return fallback;
  }

  return (
    <img
      src={imgSrc}
      onError={handleError}
      alt={alt}
      className="task-detail__detail-modal-field-value-item-url-favicon" 
    />
  );
};

export default ImgFallback;