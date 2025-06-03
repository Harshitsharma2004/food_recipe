import React from 'react';
import './Modal.css';

function Modal({ children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <dialog className="modal-content" open onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </dialog>
    </div>
  );
}

export default Modal;
