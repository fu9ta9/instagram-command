import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div
        className="
          bg-white rounded-lg
          w-full max-w-lg
          max-h-[90vh]
          mx-2 my-4
          sm:max-w-3xl
          sm:my-8
          overflow-y-auto
          shadow-lg
          pb-safe
        "
        style={{
          // iOS SafariのSafe Area対応
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          paddingTop: 'env(safe-area-inset-top, 16px)',
        }}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">自動返信登録</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="p-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;