import React, { ReactNode, useEffect, useState } from 'react';

interface AvatarItemProps {
  size?: number;
  isOverflow?: boolean;
  children: ReactNode;
  isFirst?: boolean;
  fontSize?: number;
  src?: string | null;
}

const AvatarItem: React.FC<AvatarItemProps> = ({
  size = 24,
  isOverflow = false,
  children,
  isFirst = false,
  fontSize,
  src,
}) => {
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    if (!src) {
      setImgError(false);
      return;
    }

    setImgError(false);
    const img = new Image();
    img.src = src;
    img.onerror = () => setImgError(true);
  }, [src]);

  const randomId = Math.random().toString(36).substring(2, 9);
  const clipPathId = `avatarClipPath-${Math.random().toString(36).substring(2, 9)}`;
  const baseGradientId = `avatarBaseGradient-${Math.random().toString(36).substring(2, 9)}`;
  const topLeftGradientId = `avatarTopLeftGradient-${Math.random().toString(36).substring(2, 9)}`;
  const topRightGradientId = `avatarTopRightGradient-${Math.random().toString(36).substring(2, 9)}`;
  const imgPatternId = `avatarImagePattern-${randomId}`;

  const centerX = size / 2;
  const centerY = size / 2 - 1;
  const baseGradientAngle = 11.47;
  const defaultFontSize = size * 0.5;
  const radialGradientRadius = '75%';

  const scaledClipPathData = `
    M ${0.5 * size},0
    C ${0.1 * size},0 ${0 * size},${0.1 * size} ${0 * size},${0.5 * size}
    C ${0 * size},${0.9 * size} ${0.1 * size},${1 * size} ${0.5 * size},${1 * size}
    C ${0.9 * size},${1 * size} ${1 * size},${0.9 * size} ${1 * size},${0.5 * size}
    C ${1 * size},${0.1 * size} ${0.9 * size},${0 * size} ${0.5 * size},${0 * size}
    Z
  `;

  const overflowBackgroundColor = 'rgba(228, 232, 238, 1)';
  const overflowTextColor = 'rgba(125, 137, 152, 1)';
  const overflowFontSize = fontSize !== undefined ? fontSize : defaultFontSize;
  const overflowFontWeight = '400';
  const borderStroke = 'white';
  const borderStrokeWidth = 1;

  const isStringChild = typeof children === 'string' || typeof children === 'number';

  const showFallback = !src || imgError;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', marginLeft: `${isFirst ? -6 : 0}` }}
    >
      <defs>
        <clipPath id={clipPathId}>
          <path d={scaledClipPathData} />
        </clipPath>

        {/* 이미지가 없을 때만 그라데이션 정의 */}
        {!isOverflow && showFallback && (
          <>
            <linearGradient
              id={baseGradientId}
              gradientTransform={`rotate(${baseGradientAngle} ${centerX} ${centerY})`}
              x1="0%" y1="0%" x2="100%" y2="0%"
            >
              <stop offset="24.29%" stopColor="#CE8ED7" />
              <stop offset="89.68%" stopColor="#5E6FFB" />
            </linearGradient>

            <radialGradient
              id={topLeftGradientId}
              cx="0%" cy="0%" r={radialGradientRadius} fx="0%" fy="0%"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="rgba(199, 135, 208, 1)" />
              <stop offset="100%" stopColor="rgba(199, 135, 208, 0)" />
            </radialGradient>

            <radialGradient
              id={topRightGradientId}
              cx="100%" cy="0%" r={radialGradientRadius} fx="100%" fy="0%"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="rgba(119, 101, 255, 1)" />
              <stop offset="100%" stopColor="rgba(119, 101, 255, 0)" />
            </radialGradient>
          </>
        )}
        {/* 이미지가 있을 경우, 이미지를 채울 패턴 정의 */}
        {!showFallback && !isOverflow && (
          <pattern id={imgPatternId} patternContentUnits="objectBoundingBox" width="1" height="1">
            <image href={src} x="0" y="0" height="1" width="1" preserveAspectRatio="xMidYMid slice" />
          </pattern>
        )}
      </defs>

      {/* 아바타 모양으로 잘라낼 그룹 */}
      <g clipPath={`url(#${clipPathId})`}>
        {isOverflow ? (
          <rect x="0" y="0" width={size} height={size} fill={overflowBackgroundColor} />
        ) : showFallback ? (
          // 👈 그라데이션으로 채우기
          <>
            <rect x="0" y="0" width={size} height={size} fill={`url(#${baseGradientId})`} />
            <rect x="0" y="0" width={size} height={size} fill={`url(#${topLeftGradientId})`} />
            <rect x="0" y="0" width={size} height={size} fill={`url(#${topRightGradientId})`} />
          </>
        ) : (
          // 👈 이미지 패턴으로 채우기
          <rect x="0" y="0" width={size} height={size} fill={`url(#${imgPatternId})`} />
        )}
      </g>

      {/* 겹치는 아바타의 테두리 */}
      {isFirst && (<path d={scaledClipPathData} fill="none" stroke={borderStroke} strokeWidth={borderStrokeWidth} />)}

      {/* 텍스트/아이콘 (이미지가 없을 때만 렌더링) */}
      {showFallback && (
        isStringChild ? (
          <text
            x={centerX}
            y={centerY}
            fill={isOverflow ? overflowTextColor : 'white'}
            fontSize={isOverflow ? overflowFontSize : defaultFontSize}
            fontWeight={isOverflow ? overflowFontWeight : '400'}
            textAnchor="middle"
            dominantBaseline="central"
            className='flex-shrink-0'
          >
            {children}
          </text>
        ) : (
          <foreignObject x="0" y="0" width={size} height={size}>
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              width: '100%', height: '100%', color: isOverflow ? overflowTextColor : 'white',
            }}
              className='flex-shrink-0'
            >
              {children}
            </div>
          </foreignObject>
        )
      )}
    </svg>
  );
};

export default AvatarItem;