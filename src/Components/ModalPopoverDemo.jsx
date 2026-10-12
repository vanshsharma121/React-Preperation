import { useState } from "react";
import {
  Layers,
  AlertTriangle,
  FileText,
  Download,
  BellOff,
  Settings,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
} from "lucide-react";
import { useModal } from "../context/ModalContext";
import Popover from "./Popover";
import "../styles/modal-popover.css";
import "../styles/pagination.css"; // Reuse wrapper styling

/**
 * ModalPopoverDemo Component
 * 
 * Interactive showcase demonstrating:
 * 1. Global context-driven modals (Confirmation & Custom Forms)
 * 2. Click-outside-dismissible popover menus using Lucide SVG icons
 */
export default function ModalPopoverDemo() {
  const { openModal } = useModal();
  const [feedback, setFeedback] = useState("");

  // Demo 1: Trigger a destructive confirmation modal
  const handleOpenDeleteModal = () => {
    openModal({
      title: (
        <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444" }}>
          <AlertTriangle size={20} />
          <span>Delete Item Confirmation</span>
        </span>
      ),
      content: (
        <div>
          <p>Are you sure you want to delete <strong>Product Item #42</strong>?</p>
          <p style={{ marginTop: "8px", fontSize: "0.85rem", color: "#ef4444" }}>
            This action cannot be undone and will permanently remove this record.
          </p>
        </div>
      ),
      confirmText: "Delete Permanently",
      cancelText: "Keep Item",
      onConfirm: () => {
        setFeedback("Product Item #42 was successfully deleted!");
      },
    });
  };

  // Demo 2: Trigger a feedback / form modal
  const handleOpenFormModal = () => {
    openModal({
      title: (
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={20} color="var(--accent)" />
          <span>Submit Quick Feedback</span>
        </span>
      ),
      content: (
        <div>
          <p>Tell us what you think of this pagination & modal architecture:</p>
          <textarea
            rows={3}
            placeholder="Type your notes here..."
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text-h)",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
      ),
      confirmText: "Submit Note",
      cancelText: "Dismiss",
      onConfirm: () => {
        setFeedback("Thank you! Your feedback was recorded.");
      },
    });
  };

  return (
    <div className="pagination-wrapper">
      <div className="pagination-header">
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={22} color="var(--accent)" />
            <span>Modals & Popovers</span>
          </h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text)" }}>
            Driven by <code>useModal()</code> Context, React Portals, and click-outside listeners.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            marginBottom: "16px",
            borderRadius: "8px",
            background: "var(--accent-bg)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent)",
            fontSize: "0.9rem",
          }}
        >
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", margin: "20px 0" }}>
        {/* Modal Button 1: Confirmation */}
        <button
          type="button"
          className="pagination-btn"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", height: "auto" }}
          onClick={handleOpenDeleteModal}
        >
          <AlertTriangle size={15} color="#ef4444" />
          <span>Trigger Delete Modal</span>
        </button>

        {/* Modal Button 2: Form */}
        <button
          type="button"
          className="pagination-btn"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", height: "auto" }}
          onClick={handleOpenFormModal}
        >
          <FileText size={15} />
          <span>Trigger Form Modal</span>
        </button>

        {/* Popover Action Menu */}
        <Popover
          trigger={
            <button
              type="button"
              className="pagination-btn active"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", height: "auto" }}
            >
              <span>Quick Actions</span>
              <ChevronDown size={14} />
            </button>
          }
          content={({ close }) => (
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "8px", color: "var(--text-h)" }}>
                SELECT AN OPTION
              </div>
              <button
                type="button"
                className="popover-menu-item"
                onClick={() => {
                  setFeedback("Exporting report...");
                  close();
                }}
              >
                <Download size={15} />
                <span>Export CSV Data</span>
              </button>
              <button
                type="button"
                className="popover-menu-item"
                onClick={() => {
                  setFeedback("Notifications muted.");
                  close();
                }}
              >
                <BellOff size={15} />
                <span>Mute Notifications</span>
              </button>
              <button
                type="button"
                className="popover-menu-item"
                onClick={() => {
                  setFeedback("Preferences opened.");
                  close();
                }}
              >
                <Settings size={15} />
                <span>Open Preferences</span>
              </button>
            </div>
          )}
        />
      </div>

      <div
        style={{
          padding: "16px",
          background: "var(--code-bg)",
          borderRadius: "10px",
          fontSize: "0.85rem",
          lineHeight: "150%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
          <Lightbulb size={16} color="var(--accent)" />
          <span>Key Learning Points:</span>
        </div>
        <ul style={{ margin: "8px 0 0", paddingLeft: "20px" }}>
          <li>
            <strong>React Portals:</strong> The modal renders into <code>document.body</code>, so it escapes any CSS <code>overflow: hidden</code> or stacking bugs.
          </li>
          <li>
            <strong>Escape Key & Backdrop Click:</strong> Pressing <kbd>Esc</kbd> or clicking outside automatically dismisses the modal.
          </li>
          <li>
            <strong>Click-outside Popover:</strong> Clicking anywhere outside the dropdown closes it cleanly via <code>mousedown</code> event listener.
          </li>
        </ul>
      </div>
    </div>
  );
}
