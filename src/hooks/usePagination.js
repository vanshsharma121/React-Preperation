import { useMemo } from "react";

/**
 * Calculates a list of visible page numbers with smart ellipsis ("...").
 * 
 * @param {number} currentPage - The currently active page (1-based index).
 * @param {number} totalPages  - The total number of pages.
 * @param {number} delta       - Number of page siblings to show around the current page (default: 1).
 * @returns {Array<number|string>} An array of page numbers and ellipsis, e.g. [1, "...", 4, 5, 6, "...", 20]
 */
function getPageNumbers(currentPage, totalPages, delta = 1) {
  const pages = [];
  const result = [];

  // ---------------------------------------------------------------------------
  // STEP 1: Identify all candidate page numbers we want to include.
  // We ALWAYS want:
  //   1. The first page (page 1)
  //   2. The last page (totalPages)
  //   3. A sliding window around the active page (from currentPage - delta to currentPage + delta)
  // ---------------------------------------------------------------------------
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 2: Iterate through candidate pages and detect gaps between numbers.
  // 
  // Example scenario: pages = [1, 9, 10, 11, 20]
  // - Gap between 1 and 9: (9 - 1 = 8 > 2) -> insert "..." between them!
  // - Gap between 9 and 10: (10 - 9 = 1)   -> consecutive, no gap.
  // - Gap between 1 and 3: (3 - 1 = 2)     -> only 1 number missing (2), so insert 2 instead of "..."!
  // ---------------------------------------------------------------------------
  let prev = 0;
  for (const page of pages) {
    if (prev) {
      // If there is only ONE missing number between 'prev' and 'page' (e.g. 1 and 3):
      if (page - prev === 2) {
        result.push(prev + 1);
      } 
      // If there are TWO OR MORE missing numbers (e.g. 1 and 5):
      else if (page - prev > 2) {
        result.push("...");
      }
    }
    result.push(page);
    prev = page;
  }

  return result;
}

/**
 * Custom Hook: usePagination
 * 
 * Encapsulates pagination calculation logic so it can be reused across any
 * table, list, or component without duplicating math.
 * 
 * Uses `useMemo` so this calculation only runs when `currentPage`, `totalPages`,
 * or `delta` change. Unrelated re-renders (like theme toggles or typing in inputs)
 * will reuse the cached array for optimal performance.
 */
export function usePagination({ currentPage, totalPages, delta = 1 }) {
  const pages = useMemo(() => {
    return getPageNumbers(currentPage, totalPages, delta);
  }, [currentPage, totalPages, delta]);

  return pages;
}
