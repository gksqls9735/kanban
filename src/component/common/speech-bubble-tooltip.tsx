const SpeechBubbleTooltip: React.FC<{
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  arrowOffset?: string;
  maxWidth?: number;
}> = ({ children, placement = 'top', arrowOffset, maxWidth }) => {
  const boxClassName = `speech-bubble-tooltip speech-bubble-tooltip-${placement}`;

  const boxStyle: React.CSSProperties = {
    '--arrow-offset': arrowOffset,
  } as React.CSSProperties;

  const itemMaxWidth = maxWidth ? maxWidth : '200px';

  return (
    <>
      <div className={boxClassName} style={{ ...boxStyle, maxWidth: itemMaxWidth }}>
        {children}
      </div>
    </>
  );
};

export default SpeechBubbleTooltip;