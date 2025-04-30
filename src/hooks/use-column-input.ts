import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { colors, ViewModes } from "../constants";

interface useColumnInputProps {
  isActive: boolean,
  viewMode: string,
  initialName?: string,
  initialColor?: string,
  onSubmit: (name: string, color?: string) => void,
  onToggle: () => void,
}

const useColumnInput = ({
  isActive, viewMode, initialName = '', initialColor, onSubmit, onToggle
}: useColumnInputProps) => {
  const defaultInitialColor = viewMode === ViewModes.STATUS ? (initialColor || colors[0]) : '';
  const [selectedColor, setSelectedColor] = useState<string>(defaultInitialColor);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholderTxt = useMemo(() => viewMode === ViewModes.STATUS ? '상태명' : '섹션명', [viewMode]);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.value = initialName;
      inputRef.current.focus();

      if (!initialName && viewMode === ViewModes.STATUS) {
        setSelectedColor(colors[0]);
      } else if (viewMode === ViewModes.STATUS && initialColor) {
        setSelectedColor(initialColor);
      }
    }
  }, [isActive, initialName, initialColor, viewMode]);

  const handleConfirmClick = useCallback(() => {
    const name = inputRef.current?.value.trim();
    if (name) {
      if (viewMode === ViewModes.STATUS && ['대기', '진행', '완료'].includes(name) && !initialName) {
        inputRef.current?.focus();
        alert(`'${name}'은(는) 예약된 상태명으로 생성할 수 없습니다.`);
      } else {
        const colorToSubmit = viewMode === ViewModes.STATUS ? selectedColor : undefined;
        onSubmit(name, colorToSubmit);
      }
    } else {
      inputRef.current?.focus();
    }
  }, [viewMode, selectedColor, onSubmit, initialName]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirmClick();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onToggle();
    }
  }, [handleConfirmClick, onToggle]);

  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
  }, []);

return {
  inputRef, selectedColor, placeholderTxt,
  handleConfirmClick, handleInputKeyDown, handleColorSelect
}

};

export default useColumnInput;
