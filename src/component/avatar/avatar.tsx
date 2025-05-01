import React, { ReactNode } from 'react';

interface AvatarItemProps {
  size?: number;
  isOverflow?: boolean;
  children: ReactNode;
  isFirst?: boolean;
}

const AvatarItem: React.FC<AvatarItemProps> = ({
  size = 24,
  isOverflow = false,
  children,
  isFirst = false,
}) => {
  const clipPathId = `avatarClipPath-${Math.random().toString(36).substring(2, 9)}`;
  const baseGradientId = `avatarBaseGradient-${Math.random().toString(36).substring(2, 9)}`;
  const topLeftGradientId = `avatarTopLeftGradient-${Math.random().toString(36).substring(2, 9)}`;
  const topRightGradientId = `avatarTopRightGradient-${Math.random().toString(36).substring(2, 9)}`;

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
  const overflowFontSize = '12px';
  const overflowFontWeight = '400';
  const borderStroke = 'white';
  const borderStrokeWidth = 1;

  const isStringChild = typeof children === 'string' || typeof children === 'number';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', marginLeft: `${isFirst ? -6 :  0}`  }}
    >
      <defs>
        <clipPath id={clipPathId}>
          <path d={scaledClipPathData} />
        </clipPath>

        {!isOverflow && (
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
      </defs>

      <g clipPath={`url(#${clipPathId})`}>
        {isOverflow ? (
          <rect x="0" y="0" width={size} height={size} fill={overflowBackgroundColor} />
        ) : (
          <>
            <rect x="0" y="0" width={size} height={size} fill={`url(#${baseGradientId})`} />
            <rect x="0" y="0" width={size} height={size} fill={`url(#${topLeftGradientId})`} />
            <rect x="0" y="0" width={size} height={size} fill={`url(#${topRightGradientId})`} />
          </>
        )}
      </g>

      {isFirst && (
        <path
          d={scaledClipPathData}
          fill="none"
          stroke={borderStroke}
          strokeWidth={borderStrokeWidth}
        />
      )}

      {isStringChild ? (
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              color: isOverflow ? overflowTextColor : 'white',
            }}
            className='flex-shrink-0'
          >
            {children}
          </div>
        </foreignObject>
      )}
    </svg>
  );
};

export default AvatarItem;