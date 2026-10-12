import { useState } from "react";
import { Package } from "lucide-react";
import { usePagination } from "../hooks/usePagination";
import "../styles/pagination.css";

// -----------------------------------------------------------------------------
// 1. MOCK DATASET
// In a real production app, this data would come from a REST API or GraphQL query.
// Here, we generate 100 sample items to practice client-side pagination.
// -----------------------------------------------------------------------------
const MOCK_DATA = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  title: `Product Item #${index + 1}`,
  category: index % 2 === 0 ? "Electronics" : "Accessories",
  description: `High quality description for item ${index + 1}`,
}));

export default function Pagination() {
  // Store our raw dataset in component state
  const [data] = useState(MOCK_DATA);

  // ---------------------------------------------------------------------------
  // 2. MINIMAL STATE PRINCIPLE (React Best Practice)
  // Only store what cannot be calculated!
  // - `currentPage`: which page is the user viewing (1-based index)
  // - `pageSize`: how many items per page (e.g. 5, 10, 20)
  // ---------------------------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // ---------------------------------------------------------------------------
  // 3. DERIVED CALCULATIONS
  // Never put `totalPages` or `currentItems` in useState.
  // Calculating them on each render guarantees they are always in sync with data & pageSize.
  // ---------------------------------------------------------------------------
  const totalItems = data.length;
  
  // Math.ceil ensures partial pages get their own page (e.g., 23 items / 5 = 4.6 -> 5 pages)
  const totalPages = Math.ceil(totalItems / pageSize);

  // Calculate slice boundaries for the current page
  // Example for page 1 (pageSize 5): startIndex = 0, endIndex = 5 (items 0 to 4)
  // Example for page 2 (pageSize 5): startIndex = 5, endIndex = 10 (items 5 to 9)
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Extract the exact subset of items to display on this page
  const currentItems = data.slice(startIndex, endIndex);

  // ---------------------------------------------------------------------------
  // 4. CUSTOM HOOK CALL
  // Generates smart page numbers with ellipsis (e.g. [1, "...", 4, 5, 6, "...", 20])
  // ---------------------------------------------------------------------------
  const pages = usePagination({
    currentPage,
    totalPages,
    delta: 1, // Number of adjacent page buttons on each side of the active page
  });

  // ---------------------------------------------------------------------------
  // 5. SAFE PAGE SIZE CHANGE HANDLER
  // Edge-case handling:
  // If the user is on page 20 (with pageSize = 5) and switches to pageSize = 50,
  // the new totalPages becomes 2. If we don't reset currentPage to 1, the user
  // would be stuck on non-existent page 20 with an empty screen!
  // ---------------------------------------------------------------------------
  const handlePageSizeChange = (e) => {
    // Number() converts the string value from <select> into a numeric integer
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Safely reset back to the first page
  };

  return (
    <div className="pagination-wrapper">
      {/* ----------------- TOP HEADER: Title & Page Size Dropdown ----------------- */}
      <div className="pagination-header">
        <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Package size={22} color="var(--accent)" />
          <span>Product Inventory</span>
        </h2>

        <label className="page-size-selector">
          Show per page:
          <select
            className="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            <option value={5}>5 items</option>
            <option value={10}>10 items</option>
            <option value={20}>20 items</option>
            <option value={50}>50 items</option>
          </select>
        </label>
      </div>

      {/* ----------------- ITEMS LIST: Displays Sliced Items Only ----------------- */}
      <div className="items-grid">
        {currentItems.map((item) => (
          <div key={item.id} className="item-card">
            <div className="item-card-left">
              <span className="item-badge">#{item.id}</span>
              <div>
                <h4 className="item-title">{item.title}</h4>
                <p className="item-desc">{item.description}</p>
              </div>
            </div>
            <span className="item-tag">{item.category}</span>
          </div>
        ))}
      </div>

      {/* ----------------- BOTTOM BAR: Info & Controls ----------------- */}
      <div className="pagination-footer">
        {/* Results summary:
            - Math.min(endIndex, totalItems) prevents showing "Showing 95 to 105 of 100" on the final page */}
        <div className="pagination-info">
          Showing <strong>{startIndex + 1}</strong> to{" "}
          <strong>{Math.min(endIndex, totalItems)}</strong> of{" "}
          <strong>{totalItems}</strong> items
        </div>

        {/* Navigation Buttons */}
        <div className="pagination-buttons">
          {/* Previous Button: Disabled when user is already on the first page */}
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            aria-label="Go to previous page"
          >
            &laquo; Prev
          </button>

          {/* Page Number Buttons or Ellipsis */}
          {pages.map((page, index) => {
            // If the item is "...", render non-clickable ellipsis text
            if (page === "...") {
              return (
                <span key={`dots-${index}`} className="pagination-ellipsis">
                  &hellip;
                </span>
              );
            }

            // Otherwise, render a clickable page button
            return (
              <button
                key={page}
                className={`pagination-btn ${page === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}

          {/* Next Button: Disabled when user reaches the last page */}
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            aria-label="Go to next page"
          >
            Next &raquo;
          </button>
        </div>
      </div>
    </div>
  );
}
