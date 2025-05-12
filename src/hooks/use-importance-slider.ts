import { useCallback, useEffect, useState } from "react";

interface UseImportanceSliderProps {
  trackRef: React.RefObject<HTMLElement | null>;
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const useImportanceSlider = ({
  trackRef, value, onChange,
  min = 0, max = 2, step = 0.5,
}: UseImportanceSliderProps) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const calcPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return value;

    const trackRect = trackRef.current.getBoundingClientRect();
    const trackLeft = trackRect.left;
    const trackWidth = trackRect.width;

    if (trackWidth === 0) return value;

    let positionRatio = (clientX - trackLeft) / trackWidth;
    positionRatio = Math.max(0, Math.min(1, positionRatio));

    let newValue = min + positionRatio * (max - min);
    newValue = Math.round(newValue / step) * step;
    newValue = Math.max(min, Math.min(max, newValue));

    return newValue;
  }, [trackRef, min, max, step, value]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newValue = calcPosition(e.clientX);
    if (newValue !== value) onChange(newValue);
  }, [isDragging, calcPosition, onChange, value]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = '';
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const onMouseDownHandler = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const newValue = calcPosition(e.clientX);
    if (newValue !== value) onChange(newValue);
  }, [calcPosition, onChange, value]);

  return { onMouseDownHandler, isDragging };
}