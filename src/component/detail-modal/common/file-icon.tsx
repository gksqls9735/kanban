import React from 'react';

const FileTypeIcon: React.FC<{ extension: string; color: string }> = ({ extension, color }) => {
  const iconSize = '16px';

  const textLength = extension.length;

  let dynamicFontSize: string;

  if (textLength === 1) {
    dynamicFontSize = '0.65rem';
  } else if (textLength === 2) {
    dynamicFontSize = '0.55rem';
  } else if (textLength === 3) {
    dynamicFontSize = '0.45rem';
  } else {
    dynamicFontSize = '0.45rem';
  }

  const iconStyle: React.CSSProperties = {
    backgroundColor: color,
    color: 'white',
    width: iconSize,
    height: iconSize,
    borderRadius: '1px',
    fontSize: dynamicFontSize,
    fontWeight: '700',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textTransform: 'uppercase',
    lineHeight: 1,
    boxSizing: 'border-box',
    overflow: 'hidden',
    flexShrink: 0,
  };

  const displayText = extension;

  return (
    <div style={iconStyle} title={extension}>
      {displayText}
    </div>
  );
};



export const getFileTypeInfo = (fileName: string): { icon: React.ReactNode; } => {
  const safeFileName = fileName || '';
  const extension = safeFileName.split('.').pop()?.toLocaleLowerCase() || '';

  let color = '#757575';
  let iconText: string = 'FILE';

  switch (extension) {
    case 'pdf':
      iconText = 'PDF';
      color = '#F63D68';
      break;
    case 'docx':
    case 'doc':
      iconText = 'W';
      color = '#0BA5EC';
      break;
    case 'pptx':
    case 'ppt':
      iconText = 'P';
      color = '#FB6514';
      break;
    case 'xlsx':
    case 'xls':
      iconText = 'X';
      color = '#43A047';
      break;
    case 'txt':
      iconText = 'TXT';
      color = '#78909C';
      break;
    case 'hwp':
      iconText = 'HWP';
      color = '#FFB300';
      break;

    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
      iconText = 'IMG';
      color = '#8E24AA';
      break;

    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      iconText = 'ZIP';
      color = '#6D4C41';
      break;

    case 'html':
    case 'htm':
      iconText = 'HTML';
      color = '#E65100';
      break;
    case 'css':
      iconText = 'CSS';
      color = '#0277BD';
      break;
    case 'js':
    case 'jsx':
      iconText = 'JS';
      color = '#FFD600';
      break;
    case 'ts':
    case 'tsx':
      iconText = 'TS';
      color = '#3178C6';
      break;

    default:
      iconText = extension;
      color = '#546E7A';
      break;
  }

  const icon = <FileTypeIcon extension={iconText} color={color} />;

  return {
    icon: icon,
  };
};


