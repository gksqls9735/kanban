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
      if (!el || el.contains(e.target as Node) || e.composedPath().includes(el)) return;
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