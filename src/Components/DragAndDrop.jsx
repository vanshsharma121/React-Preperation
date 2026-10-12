import { useState } from "react";
import { Kanban, RotateCcw, ListTodo, Clock, CheckCircle2, GripVertical, Lightbulb } from "lucide-react";
import "../styles/drag-drop.css";

// -----------------------------------------------------------------------------
// 1. INITIAL KANBAN BOARD DATA
// Represents tasks distributed across three standard agile columns.
// -----------------------------------------------------------------------------
const INITIAL_TASKS = [
  { id: "task-1", title: "Implement pagination with ellipses", status: "done", tag: "feature" },
  { id: "task-2", title: "Build infinite scroll feed", status: "done", tag: "feature" },
  { id: "task-3", title: "Virtualize 10,000 items in list", status: "in-progress", tag: "ui" },
  { id: "task-4", title: "Fix edge-case on page size reset", status: "in-progress", tag: "bug" },
  { id: "task-5", title: "Build native HTML5 drag and drop", status: "todo", tag: "feature" },
  { id: "task-6", title: "Write unit tests for usePagination", status: "todo", tag: "ui" },
];

const COLUMNS = [
  { id: "todo", label: "To Do", icon: ListTodo },
  { id: "in-progress", label: "In Progress", icon: Clock },
  { id: "done", label: "Completed", icon: CheckCircle2 },
];

/**
 * DragAndDrop Component
 * 
 * Teaches native HTML5 Drag and Drop in React with:
 * 1. Column-to-Column transitions
 * 2. In-place reordering within the SAME column (card-on-card drop)
 * 3. Accurate visual indicators and clean state mutations
 */
export default function DragAndDrop() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  
  // Track which card is actively being dragged
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Track which column is currently being hovered
  const [dragOverColumnId, setDragOverColumnId] = useState(null);

  // Track which specific CARD is being hovered for in-place reordering
  const [dragOverCardId, setDragOverCardId] = useState(null);

  // ---------------------------------------------------------------------------
  // EVENT 1: onDragStart (Triggered on the draggable card)
  // ---------------------------------------------------------------------------
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);

    // HTML5 DataTransfer API:
    // Storing data here allows cross-window/cross-element communication
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  // ---------------------------------------------------------------------------
  // EVENT 2: onDragEnd (Triggered on the draggable card when dropped or cancelled)
  // ---------------------------------------------------------------------------
  const handleDragEnd = () => {
    // Reset all drag indicators
    setDraggedTaskId(null);
    setDragOverColumnId(null);
    setDragOverCardId(null);
  };

  // ---------------------------------------------------------------------------
  // EVENT 3: onDragOver on Column (Triggered on the column background)
  // 
  // ⚠️ CRITICAL BROWSER RULE:
  // By default, browsers REJECT dropping data onto other HTML elements.
  // Calling `e.preventDefault()` tells the browser: "Allow dropping here!"
  // ---------------------------------------------------------------------------
  const handleColumnDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleColumnDragEnter = (columnId) => {
    setDragOverColumnId(columnId);
  };

  const handleColumnDragLeave = (e, columnId) => {
    // Only clear if the cursor truly left the column (not just hovered over a card inside)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (dragOverColumnId === columnId) {
        setDragOverColumnId(null);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // EVENT 4: onDragOver on Card (FOR REORDERING WITHIN SAME/DIFFERENT COLUMN)
  // 
  // When dragging over another card, stop propagation so the column drag-over
  // doesn't override the card's target slot.
  // ---------------------------------------------------------------------------
  const handleCardDragOver = (e, cardId) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents bubbling to column
    if (draggedTaskId !== cardId && dragOverCardId !== cardId) {
      setDragOverCardId(cardId);
    }
  };

  const handleCardDragLeave = (e, cardId) => {
    e.stopPropagation();
    if (dragOverCardId === cardId) {
      setDragOverCardId(null);
    }
  };

  // ---------------------------------------------------------------------------
  // EVENT 5: onDrop directly onto a Card (REORDERING IN PLACE)
  // 
  // How Array Reordering Works:
  // 1. Locate the source index of the dragged item
  // 2. Locate the target index of the card we dropped onto
  // 3. Remove item from source index using .splice(sourceIndex, 1)
  // 4. Update its status to the target card's column
  // 5. Insert item at target index using .splice(targetIndex, 0, item)
  // ---------------------------------------------------------------------------
  const handleCardDrop = (e, targetTask) => {
    e.preventDefault();
    e.stopPropagation(); // Do not trigger column drop

    const droppedId = e.dataTransfer.getData("text/plain") || draggedTaskId;

    // Guard: Dropping card onto itself does nothing
    if (!droppedId || droppedId === targetTask.id) {
      handleDragEnd();
      return;
    }

    setTasks((prevTasks) => {
      const sourceIndex = prevTasks.findIndex((t) => t.id === droppedId);
      const targetIndex = prevTasks.findIndex((t) => t.id === targetTask.id);

      if (sourceIndex === -1 || targetIndex === -1) return prevTasks;

      const newTasks = [...prevTasks];
      // Remove the dragged task from its original position
      const [movedTask] = newTasks.splice(sourceIndex, 1);

      // Assign the new status (moves between columns if needed)
      const updatedTask = { ...movedTask, status: targetTask.status };

      // Insert directly at the target card's slot!
      newTasks.splice(targetIndex, 0, updatedTask);

      return newTasks;
    });

    handleDragEnd();
  };

  // ---------------------------------------------------------------------------
  // EVENT 6: onDrop into Column Background (APPEND TO COLUMN)
  // Triggered when dropped into empty space in a column (not directly on a card)
  // ---------------------------------------------------------------------------
  const handleColumnDrop = (e, targetColumnId) => {
    e.preventDefault();

    const droppedId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (!droppedId) return;

    setTasks((prevTasks) => {
      const sourceIndex = prevTasks.findIndex((t) => t.id === droppedId);
      if (sourceIndex === -1) return prevTasks;

      const newTasks = [...prevTasks];
      const [movedTask] = newTasks.splice(sourceIndex, 1);

      // Place it at the end of the destination column
      newTasks.push({ ...movedTask, status: targetColumnId });

      return newTasks;
    });

    handleDragEnd();
  };

  return (
    <div className="dnd-wrapper">
      <div className="pagination-header">
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Kanban size={22} color="var(--accent)" />
            <span>Native Drag & Drop Kanban</span>
          </h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text)" }}>
            Drag cards between columns <strong>OR</strong> reorder them inside the same column!
          </p>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          className="pagination-btn"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          onClick={() => setTasks(INITIAL_TASKS)}
        >
          <RotateCcw size={15} />
          <span>Reset Tasks</span>
        </button>
      </div>

      {/* The 3-Column Kanban Board */}
      <div className="dnd-board">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          const isOverColumn = dragOverColumnId === column.id;
          const ColumnIcon = column.icon;

          return (
            <div
              key={column.id}
              className={`dnd-column ${isOverColumn ? "drag-over" : ""}`}
              onDragOver={handleColumnDragOver}
              onDragEnter={() => handleColumnDragEnter(column.id)}
              onDragLeave={(e) => handleColumnDragLeave(e, column.id)}
              onDrop={(e) => handleColumnDrop(e, column.id)}
            >
              {/* Column Header with Icon */}
              <div className="dnd-column-header">
                <h4 className="dnd-column-title">
                  <ColumnIcon size={16} />
                  <span>{column.label}</span>
                </h4>
                <span className="dnd-count-pill">{columnTasks.length}</span>
              </div>

              {/* Cards List inside this Column */}
              <div className="dnd-card-list">
                {columnTasks.map((task) => {
                  const isDragging = draggedTaskId === task.id;
                  const isHoverTarget = dragOverCardId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleCardDragOver(e, task.id)}
                      onDragLeave={(e) => handleCardDragLeave(e, task.id)}
                      onDrop={(e) => handleCardDrop(e, task)}
                      className={`dnd-card ${isDragging ? "is-dragging" : ""} ${isHoverTarget ? "drag-over-card" : ""}`}
                    >
                      <div className="dnd-card-header">
                        <span className={`dnd-card-tag tag-${task.tag}`}>{task.tag}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text)" }}>{task.id}</span>
                          <GripVertical size={14} color="var(--text)" style={{ opacity: 0.6 }} />
                        </div>
                      </div>
                      <p className="dnd-card-title">{task.title}</p>
                    </div>
                  );
                })}

                {/* Empty column drop zone placeholder */}
                {columnTasks.length === 0 && (
                  <div className="dnd-empty-placeholder">
                    Drop a task here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational Cheatsheet */}
      <div
        style={{
          marginTop: "18px",
          padding: "16px",
          background: "var(--code-bg)",
          borderRadius: "10px",
          fontSize: "0.85rem",
          lineHeight: "155%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
          <Lightbulb size={16} color="var(--accent)" />
          <span>How Reordering in the Same Column Works:</span>
        </div>
        <ul style={{ margin: "6px 0 0", paddingLeft: "20px" }}>
          <li>
            <strong>Card-level <code>onDragOver</code>:</strong> Listening on each individual card lets us know <em>exactly which position</em> the user wants to drop into.
          </li>
          <li>
            <strong><code>e.stopPropagation()</code>:</strong> Stops the card drop event from bubbling up to the column container, ensuring precise positional insertion.
          </li>
          <li>
            <strong>Array <code>splice()</code>:</strong> We extract the item with <code>splice(sourceIndex, 1)</code> and insert it at the target slot with <code>splice(targetIndex, 0, movedItem)</code>.
          </li>
        </ul>
      </div>
    </div>
  );
}
