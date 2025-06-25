import { useEffect } from "react"

const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (E: MouseEvent | TouchEvent) => void,
  isActive: boolean = true,
) => {
  useEffect(() => {
    if (!isActive) return;

    const listener = (e: MouseEvent | TouchEvent) => {
      const el = ref.current;
      const target = e.target as HTMLElement;

      const isClickInsideSelectionDropdownMenu = target.closest('.selection-dropdown__menu');

      if (!el ||
        el.contains(target) ||
        e.composedPath().includes(el) ||
        isClickInsideSelectionDropdownMenu
      ) return;

      handler(e);
    }

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, isActive]);
};

export default useClickOutside;