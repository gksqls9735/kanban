const SelectionCheckBox: React.FC<{
  width: number;
  height: number;
  borderColor: string;
  backgroundColor: string;
}> = ({ width, height, borderColor, backgroundColor }) => {
  return (
    <div style={{
      width: width,
      height: height,
      borderRadius: 4,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: borderColor,
      backgroundColor: backgroundColor,
      flexShrink: 0,
      boxSizing: 'border-box'
    }} />
  );
};

export default SelectionCheckBox;