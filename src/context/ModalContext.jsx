import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import "../styles/modal-popover.css";

// -----------------------------------------------------------------------------
// 1. CONTEXT CREATION
// -----------------------------------------------------------------------------
const ModalContext = createContext({
  openModal: () => {},
  closeModal: () => {},
});

/**
 * ModalProvider
 * 
 * Global Modal Manager that allows ANY component in the app to open a modal
 * without having to maintain `const [isOpen, setIsOpen] = useState(false)` everywhere.
 * 
 * Uses `createPortal` to render the modal directly into `document.body`.
 * This prevents the modal from being clipped by parent `overflow: hidden` or `z-index` contexts!
 */
export function ModalProvider({ children }) {
  const [modalConfig, setModalConfig] = useState(null);

  // Opens a modal with customizable configuration
  const openModal = useCallback((config) => {
    setModalConfig(config);
  }, []);

  // Closes the active modal
  const closeModal = useCallback(() => {
    setModalConfig(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Accessibility & UX: Close modal on pressing the 'Escape' key
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && modalConfig) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalConfig, closeModal]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {/* ---------------------------------------------------------------------
          2. REACT PORTAL
          If a modal is open, mount it directly to <body> instead of inside
          the local React component tree.
      --------------------------------------------------------------------- */}
      {modalConfig &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={closeModal} // Click outside backdrop to close
            role="dialog"
            aria-modal="true"
          >
            {/* Stop propagation so clicking inside the modal card does not close it */}
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="modal-header">
                <h3>{modalConfig.title || "Notice"}</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={closeModal}
                  aria-label="Close dialog"
                >
                  &times;
                </button>
              </div>

              {/* Body */}
              <div className="modal-body">{modalConfig.content}</div>

              {/* Footer Actions */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn modal-btn-cancel"
                  onClick={closeModal}
                >
                  {modalConfig.cancelText || "Cancel"}
                </button>

                {modalConfig.onConfirm && (
                  <button
                    type="button"
                    className="modal-btn modal-btn-confirm"
                    onClick={() => {
                      modalConfig.onConfirm();
                      closeModal();
                    }}
                  >
                    {modalConfig.confirmText || "Confirm"}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </ModalContext.Provider>
  );
}

/**
 * Custom Hook: useModal
 * 
 * Allows any component to easily trigger modals:
 * const { openModal, closeModal } = useModal();
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
