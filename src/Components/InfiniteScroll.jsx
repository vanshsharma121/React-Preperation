import { useState, useEffect, useRef, useCallback } from "react";
import { Infinity as InfinityIcon, CheckCircle2 } from "lucide-react";
import "../styles/infinite-scroll.css";
import "../styles/pagination.css"; // Reuse card styles

// -----------------------------------------------------------------------------
// 1. MOCK API SERVICE & INITIAL DATA GENERATOR
// In a real production app, data comes from a REST or GraphQL endpoint.
// -----------------------------------------------------------------------------
const TOTAL_AVAILABLE_ITEMS = 60; // Total records available in our mock database
const BATCH_SIZE = 10;            // Number of items to fetch per batch

function generateMockItems(startIndex, count) {
  return Array.from({ length: count }, (_, i) => ({
    id: startIndex + i + 1,
    title: `Stream Item #${startIndex + i + 1}`,
    category: (startIndex + i) % 2 === 0 ? "Realtime Feed" : "Analytics Alert",
    time: `${Math.floor(Math.random() * 50) + 1}m ago`,
  }));
}

function fetchMockItems(page) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const startIndex = (page - 1) * BATCH_SIZE;
      const count = Math.min(BATCH_SIZE, Math.max(0, TOTAL_AVAILABLE_ITEMS - startIndex));
      const batch = generateMockItems(startIndex, count);

      resolve({
        items: batch,
        hasMore: startIndex + count < TOTAL_AVAILABLE_ITEMS,
      });
    }, 700); // 700ms realistic network delay
  });
}

/**
 * InfiniteScroll Component
 * 
 * Demonstrates modern, high-performance infinite scrolling using the browser's
 * native `IntersectionObserver` API instead of sluggish `scroll` event listeners.
 */
export default function InfiniteScroll() {
  // ---------------------------------------------------------------------------
  // 2. STATE MANAGEMENT
  // Best Practice UX: Initialize state with the first batch so the user sees
  // content immediately without an awkward empty screen or cascading render warning.
  // ---------------------------------------------------------------------------
  const [items, setItems] = useState(() => generateMockItems(0, BATCH_SIZE));
  const [page, setPage] = useState(2); // Next page to fetch
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Reference to the scrollable viewport container
  const containerRef = useRef(null);

  // Reference to the "Sentinel" DOM element placed at the bottom of the list
  const sentinelRef = useRef(null);

  // ---------------------------------------------------------------------------
  // 3. ASYNC DATA FETCHING HANDLER
  // Wrapped in `useCallback` so its identity remains stable across renders.
  // ---------------------------------------------------------------------------
  const loadMoreItems = useCallback(async () => {
    // Guard clause: Avoid redundant fetches if already loading or no data left
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const response = await fetchMockItems(page);

      // Append new items to existing items array
      setItems((prevItems) => [...prevItems, ...response.items]);
      setHasMore(response.hasMore);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Failed to load infinite scroll items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  // ---------------------------------------------------------------------------
  // 4. INTERSECTION OBSERVER SETUP
  // 
  // Why IntersectionObserver?
  // - Old approach: Listening to `onScroll` runs dozens of times per second on
  //   the main thread, causing lag and layout thrashing.
  // - Modern approach: `IntersectionObserver` runs asynchronously off the main thread.
  //   It only alerts React when the bottom sentinel enters the visible boundary!
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        // When the bottom sentinel enters the scrollable viewport:
        if (entry.isIntersecting && !isLoading) {
          loadMoreItems();
        }
      },
      {
        root: containerRef.current, // Observe visibility relative to the container
        rootMargin: "80px",         // Pre-fetch 80px BEFORE reaching the bottom for butter-smooth UX!
        threshold: 0.1,             // Trigger as soon as 10% of sentinel is visible
      }
    );

    const currentSentinel = sentinelRef.current;
    observer.observe(currentSentinel);

    // CLEANUP: Unobserve & disconnect when component unmounts or re-evaluates
    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
      observer.disconnect();
    };
  }, [hasMore, isLoading, loadMoreItems]);

  return (
    <div className="infinite-wrapper">
      {/* Header */}
      <div className="infinite-header">
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <InfinityIcon size={22} color="var(--accent)" />
            <span>Infinite Scroll Feed</span>
          </h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text)" }}>
            Automatically loads more data as you scroll using <code>IntersectionObserver</code>.
          </p>
        </div>
        <span className="infinite-badge">
          Loaded {items.length} of {TOTAL_AVAILABLE_ITEMS}
        </span>
      </div>

      {/* Scrollable Container */}
      <div className="infinite-scroll-container" ref={containerRef}>
        {items.map((item) => (
          <div key={item.id} className="item-card">
            <div className="item-card-left">
              <span className="item-badge">#{item.id}</span>
              <div>
                <h4 className="item-title">{item.title}</h4>
                <p className="item-desc">Streamed feed record</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="item-tag">{item.category}</span>
              <div style={{ fontSize: "0.75rem", color: "var(--text)", marginTop: "4px" }}>
                {item.time}
              </div>
            </div>
          </div>
        ))}

        {/* -------------------------------------------------------------------
            5. THE SENTINEL ELEMENT
            This element sits at the very bottom. When the user scrolls near it,
            the IntersectionObserver triggers `loadMoreItems()`.
        ------------------------------------------------------------------- */}
        {hasMore && (
          <div ref={sentinelRef} className="loading-sentinel">
            <div className="spinner" />
            <span>Fetching more records...</span>
          </div>
        )}

        {/* End of results message */}
        {!hasMore && (
          <div className="end-message" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <CheckCircle2 size={18} color="var(--accent)" />
            <span><strong>All caught up!</strong> You have viewed all {TOTAL_AVAILABLE_ITEMS} records.</span>
          </div>
        )}
      </div>
    </div>
  );
}
