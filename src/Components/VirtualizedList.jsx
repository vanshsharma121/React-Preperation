import { useState, useMemo } from "react";
import { Zap, Lightbulb } from "lucide-react";
import "../styles/virtual-list.css";

// -----------------------------------------------------------------------------
// 1. GENERATE A MASSIVE DATASET (10,000 ITEMS!)
// Rendering 10,000 standard DOM elements simultaneously freezes the browser.
// Virtualization solves this by only rendering what is currently visible on screen.
// -----------------------------------------------------------------------------
const TOTAL_ITEMS = 10000;
const ITEM_HEIGHT = 64;       // Each item row is fixed at 64px height
const VIEWPORT_HEIGHT = 448;   // Viewport shows 7 items at once (448 / 64 = 7)
const OVERSCAN = 2;            // Render 2 extra buffer items above and below to prevent blank flickering during fast scrolling

const MASSIVE_DATASET = Array.from({ length: TOTAL_ITEMS }, (_, index) => ({
  id: index + 1,
  name: `Database Record #${index + 1}`,
  sku: `SKU-${100000 + index}`,
  status: index % 3 === 0 ? "In Stock" : index % 3 === 1 ? "Low Stock" : "Backorder",
  value: `$${((index * 13) % 900 + 49).toFixed(2)}`,
}));

/**
 * VirtualizedList Component
 * 
 * Demonstrates the concept behind popular libraries like react-window and react-virtualized.
 */
export default function VirtualizedList() {
  // Track scroll position of the viewport
  const [scrollTop, setScrollTop] = useState(0);

  // ---------------------------------------------------------------------------
  // 2. VIRTUALIZATION MATH (Windowing)
  // 
  // - startIndex: Which item is at the top of the visible window?
  //   Formula: Math.floor(scrollTop / itemHeight) - overscan
  // 
  // - endIndex: Which item is at the bottom of the visible window?
  //   Formula: Math.floor((scrollTop + viewportHeight) / itemHeight) + overscan
  // ---------------------------------------------------------------------------
  const { startIndex, endIndex, visibleItems, offsetY, totalHeight } = useMemo(() => {
    const rawStart = Math.floor(scrollTop / ITEM_HEIGHT);
    const rawEnd = Math.floor((scrollTop + VIEWPORT_HEIGHT) / ITEM_HEIGHT);

    // Clamp indices so they never go negative or exceed total items
    const start = Math.max(0, rawStart - OVERSCAN);
    const end = Math.min(TOTAL_ITEMS - 1, rawEnd + OVERSCAN);

    // Only slice the few items that fall inside this active slice!
    const items = MASSIVE_DATASET.slice(start, end + 1);

    // The pixel offset to push the visible items down to where the user scrolled
    const offset = start * ITEM_HEIGHT;

    // Total height of all 10,000 items combined (10,000 * 64px = 640,000px)
    // This gives the native scrollbar the correct proportional height and feel!
    const fullHeight = TOTAL_ITEMS * ITEM_HEIGHT;

    return {
      startIndex: start,
      endIndex: end,
      visibleItems: items,
      offsetY: offset,
      totalHeight: fullHeight,
    };
  }, [scrollTop]);

  // Handle scrolling in the viewport
  const handleScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div className="virtual-wrapper">
      <div className="pagination-header">
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={22} color="var(--accent)" />
            <span>Virtualized List (Windowing)</span>
          </h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text)" }}>
            Rendering <strong>{TOTAL_ITEMS.toLocaleString()}</strong> items with 60 FPS performance.
          </p>
        </div>
      </div>

      {/* Realtime Performance Telemetry */}
      <div className="virtual-stats-banner">
        <div>Total Dataset: <strong>{TOTAL_ITEMS.toLocaleString()} rows</strong></div>
        <div>DOM Nodes Rendered: <strong>{visibleItems.length} elements only</strong></div>
        <div>Scroll Position: <strong>{Math.round(scrollTop)}px</strong></div>
        <div>Visible Indices: <strong>#{startIndex + 1} &rarr; #{endIndex + 1}</strong></div>
      </div>

      {/* ---------------------------------------------------------------------
          3. SCROLLABLE VIEWPORT
          Fixed height (448px) with overflow-y: auto.
      --------------------------------------------------------------------- */}
      <div
        className="virtual-viewport"
        style={{ height: `${VIEWPORT_HEIGHT}px` }}
        onScroll={handleScroll}
      >
        {/* -------------------------------------------------------------------
            4. PHANTOM SPACER CONTAINER
            Height is 640,000px! This gives the scrollbar its realistic travel.
        ------------------------------------------------------------------- */}
        <div
          className="virtual-phantom-container"
          style={{ height: `${totalHeight}px` }}
        >
          {/* -----------------------------------------------------------------
              5. FLOATING WINDOW
              Pushed down by `translateY(offsetY)` to match the exact scroll location.
          ----------------------------------------------------------------- */}
          <div
            className="virtual-content-window"
            style={{
              transform: `translateY(${offsetY}px)`,
            }}
          >
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="virtual-item"
                style={{ height: `${ITEM_HEIGHT}px` }}
              >
                <div>
                  <strong>#{item.id}</strong> — {item.name}
                  <div style={{ fontSize: "0.78rem", color: "var(--text)" }}>{item.sku}</div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, color: "var(--text-h)" }}>{item.value}</div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: item.status === "In Stock" ? "rgba(34, 197, 94, 0.15)" : "rgba(234, 179, 8, 0.15)",
                      color: item.status === "In Stock" ? "#16a34a" : "#ca8a04",
                      fontWeight: 600,
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          padding: "14px 16px",
          background: "var(--code-bg)",
          borderRadius: "10px",
          fontSize: "0.85rem",
          lineHeight: "150%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
          <Lightbulb size={16} color="var(--accent)" />
          <span>Why Virtualization is Essential for Large Data:</span>
        </div>
        <p style={{ margin: "4px 0 0" }}>
          Instead of keeping 10,000 DOM elements in memory (which causes severe lag and high RAM usage),
          we reuse a tiny pool of just <strong>{visibleItems.length} DOM elements</strong>. As you scroll,
          React rapidly swaps the data inside these elements and repositions them with CSS <code>transform</code>.
        </p>
      </div>
    </div>
  );
}
