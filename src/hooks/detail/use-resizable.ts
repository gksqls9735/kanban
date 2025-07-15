import { useCallback, useEffect, useRef, useState } from "react";

const LOCAL_STORAGE_KEY = 'chartSidePanelWidth';

export const useResizable = (minWidth: number, maxWidth: number, initialWidth: number) => {
  const [width, setWidth] = useState(() => {
    const savedWidth = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedWidth ? parseFloat(savedWidth) : initialWidth;
  });

  const isResizing = useRef<boolean>(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';

    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = startWidth + (startX - event.clientX);
      if (newWidth >= minWidth && newWidth <= maxWidth) setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [width, minWidth, maxWidth]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, width.toString());
  }, [width]);

  return { width, handleMouseDown };
};