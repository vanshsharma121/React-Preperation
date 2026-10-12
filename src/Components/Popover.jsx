import { useState, useRef, useEffect } from "react";
import "../styles/modal-popover.css";

/**
 * Popover Component
 * 
 * Demonstrates:
 * 1. Compound / render-prop style composition: receives a `trigger` button and `content`.
 * 2. "Click Outside to Close" pattern using `useRef` and `mousedown` event listener.
 */
export default function Popover({ trigger, content }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // ---------------------------------------------------------------------------
  // CLICK OUTSIDE DETECTION
  // If the user clicks anywhere in the document outside this popover, close it.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="popover-container" ref={popoverRef}>
      {/* Trigger Button: Toggle popover visibility on click */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        style={{ display: "inline-block" }}
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {/* Floating Popover Card */}
      {isOpen && (
        <div className="popover-dropdown" role="region">
          {typeof content === "function" ? content({ close: () => setIsOpen(false) }) : content}
        </div>
      )}
    </div>
  );
}
