import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom';

interface ToastContextType {
  showToast: (msg: string, duration?: number) => void;
}


const Toast: React.FC<{ msg: string; }> = ({ msg }) => {
  const role = msg.includes("상태") ? 'status' : msg.includes("섹션") ? 'section' : 'task';
  return (
    <div style={{
      position: 'fixed',
      padding: '16px 22px',
      backgroundColor: '#000000E5',
      top: 104,
      left: '50%',
      transform: 'translateX(-50%)',
      fontWeight: 400,
      fontSize: 15,
      lineHeight: '100%',
      color: '#F5F5F5',
      borderRadius: 6,
      zIndex: 1001
    }} role={role} aria-live="polite">
      {msg}
    </div>
  );
};



const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    setIsToastVisible(false);
    setToastMsg('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback((msg: string, duration: number = 3000) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setToastMsg(msg);
    setIsToastVisible(true);

    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  }, [hideToast]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);


  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {isToastVisible ? ReactDOM.createPortal(
        <Toast msg={toastMsg} />, document.body
      ) : isToastVisible ? (
        <Toast msg={toastMsg} />
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
