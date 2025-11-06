import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from './icons';

interface NotificationProps {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: (id: number) => void;
  onUndo?: () => void;
}

const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
    error: <XCircleIcon className="w-6 h-6 text-red-400" />,
    info: <InformationCircleIcon className="w-6 h-6 text-sky-400" />,
};

const colors = {
    success: 'border-green-500',
    error: 'border-red-500',
    info: 'border-sky-500',
};

const Notification: React.FC<NotificationProps> = ({ id, message, type, onDismiss, onUndo }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    // Don't auto-dismiss if there's an undo action available
    if (!onUndo) {
        const timer = setTimeout(() => {
            handleDismiss();
        }, 4700);
        return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, onUndo]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(id), 300);
  }

  const handleUndo = () => {
    if (onUndo) {
        onUndo();
    }
    handleDismiss();
  }

  return (
    <div
      className={`w-full max-w-sm transform transition-all duration-300 ease-out ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className={`relative bg-slate-800/80 backdrop-blur-md rounded-lg shadow-2xl border-l-4 ${colors[type]}`}>
          <div className="p-4 flex items-start space-x-3">
              <div className="flex-shrink-0">
                  {icons[type]}
              </div>
              <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium text-slate-100">{message}</p>
                  {onUndo && (
                      <div className="mt-2">
                          <button onClick={handleUndo} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                              Undo
                          </button>
                      </div>
                  )}
              </div>
              <div className="flex-shrink-0">
                  <button onClick={handleDismiss} className="p-1 rounded-full text-slate-500 hover:bg-slate-700 hover:text-slate-100 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                      </svg>
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Notification;