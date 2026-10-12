import { useState } from "react";
import "../styles/counter.css";

/**
 * Counter Component
 * 
 * Demonstrates local state in React using the `useState` hook.
 * 
 * Best Practice Tip:
 * Notice `setCount((prev) => prev + 1)` uses the functional updater syntax.
 * Passing a function `(prev) => prev + 1` ensures you always read the freshest
 * state, avoiding race conditions if multiple state updates are batched together.
 */
export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button
      type="button"
      className="counter"
      onClick={() => setCount((prev) => prev + 1)}
      aria-label="Increment counter"
    >
      Count is {count}
    </button>
  );
}
