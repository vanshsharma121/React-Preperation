import { useState } from "react";
import { FileText, Infinity as InfinityIcon, Zap, Layers, Kanban } from "lucide-react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import Counter from "./Components/Counter";
import ThemeToggleButton from "./Components/ThemeToggleButton";
import Pagination from "./Components/Pagination";
import InfiniteScroll from "./Components/InfiniteScroll";
import VirtualizedList from "./Components/VirtualizedList";
import ModalPopoverDemo from "./Components/ModalPopoverDemo";
import DragAndDrop from "./Components/DragAndDrop";
import { ThemeProvider } from "./context/ThemeContext";
import { ModalProvider } from "./context/ModalContext";

/**
 * Root Application Component
 * 
 * Demonstrates:
 * 1. Global Context Providers (<ThemeProvider>, <ModalProvider>)
 * 2. Tab-based module switching with clean Lucide icons
 */
export default function App() {
  // Current active learning tab
  const [activeTab, setActiveTab] = useState("pagination");

  return (
    <ThemeProvider>
      {/* ModalProvider provides global modal capabilities via React Portals */}
      <ModalProvider>
        {/* App Header & Hero Section */}
        <header className="app-header">
          <div className="hero">
            <img src={heroImg} className="base" width="120" height="126" alt="Hero background" />
            <img src={reactLogo} className="framework" alt="React logo" />
            <img src={viteLogo} className="vite" alt="Vite logo" />
          </div>

          <h1>React Practice Lab</h1>
          <p>Mastering Pagination, Infinite Scroll, Virtualization, Modals & Drag-and-Drop</p>

          <div className="btn-section">
            <Counter />
            <ThemeToggleButton />
          </div>

          {/* Module Navigation Tabs */}
          <nav className="tabs-navigation" aria-label="Feature modules">
            <button
              type="button"
              className={`tab-btn ${activeTab === "pagination" ? "active" : ""}`}
              onClick={() => setActiveTab("pagination")}
            >
              <FileText size={16} />
              <span>Pagination</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "infinite" ? "active" : ""}`}
              onClick={() => setActiveTab("infinite")}
            >
              <InfinityIcon size={16} />
              <span>Infinite Scroll</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "virtual" ? "active" : ""}`}
              onClick={() => setActiveTab("virtual")}
            >
              <Zap size={16} />
              <span>Virtual List</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "modal" ? "active" : ""}`}
              onClick={() => setActiveTab("modal")}
            >
              <Layers size={16} />
              <span>Modals & Popovers</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "dnd" ? "active" : ""}`}
              onClick={() => setActiveTab("dnd")}
            >
              <Kanban size={16} />
              <span>Drag & Drop</span>
            </button>
          </nav>
        </header>

        {/* Dynamic Main Workspace according to active tab */}
        <main>
          {activeTab === "pagination" && <Pagination />}
          {activeTab === "infinite" && <InfiniteScroll />}
          {activeTab === "virtual" && <VirtualizedList />}
          {activeTab === "modal" && <ModalPopoverDemo />}
          {activeTab === "dnd" && <DragAndDrop />}
        </main>
      </ModalProvider>
    </ThemeProvider>
  );
}
