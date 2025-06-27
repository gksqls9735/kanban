import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { colors, ViewModes } from "../constants";

interface useColumnInputProps {
  isActive: boolean,
  viewMode: string,
  initialName?: string,
  initialColor?: string,
  onSubmit: (name: string, color?: string) => boolean,
  onToggle: () => void,
}

const useColumnInput = ({
  isActive, viewMode, initialName = '', initialColor, onSubmit, onToggle
}: useColumnInputProps) => {
  const defaultInitialColor = useMemo(() => {
    return viewMode === ViewModes.STATUS ? (initialColor || colors[0]) : '';
  }, [viewMode, initialColor]);

  const [selectedColor, setSelectedColor] = useState<string>(defaultInitialColor);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const placeholderTxt = useMemo(() => viewMode === ViewModes.STATUS ? '상태명' : '섹션명', [viewMode]);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.value = initialName;
      inputRef.current.focus();

      if (viewMode === ViewModes.STATUS) {
        const newColor = initialColor || colors[0];
        if (selectedColor !== newColor) setSelectedColor(newColor);
      } else {
        if (selectedColor !== '') setSelectedColor('');
      }
    }
  }, [isActive, initialName, initialColor, viewMode]);

  const handleConfirmClick = useCallback(() => {
    const name = inputRef.current?.value.trim();
    if (name) {
      const colorToSubmit = viewMode === ViewModes.STATUS ? selectedColor : undefined;
      const submissionSuccessful = onSubmit(name, colorToSubmit);
      
      if (submissionSuccessful) {
        onToggle();
      } else {
        inputRef.current?.focus();
      }
    } else {
      inputRef.current?.focus();
    }
  }, [viewMode, selectedColor, onSubmit, onToggle]);

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

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const path = e.composedPath();
      const isClickInsideContainer = path.includes(containerRef.current);

      if (isActive && !isClickInsideContainer) {
        const name = inputRef.current?.value.trim();
        if (name) {
          const colorToSubmit = viewMode === ViewModes.STATUS ? selectedColor : undefined;
          const submissionSuccessful = onSubmit(name, colorToSubmit);

          if (submissionSuccessful) {
            onToggle();
          } else {
            inputRef.current?.focus();
          }
        } else {
          onToggle();
        }
      }
    };

    if (isActive) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isActive, onSubmit, onToggle, viewMode, selectedColor]);

  return {
    inputRef, selectedColor, placeholderTxt, containerRef,
    handleConfirmClick, handleInputKeyDown, handleColorSelect
  }

};

export default useColumnInput;
