import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";

/**
 * AppLayout
 * ──────────────────────────────────────────────────
 * Desktop:  Fixed sidebar (w-72) on the left + sticky navbar on top-right
 * Mobile:   Hidden sidebar that slides in as an overlay drawer
 *
 * Structure:
 *   ┌──────────────────────────────────────┐
 *   │  [Fixed Sidebar]  │  [Sticky Navbar] │
 *   │                   │──────────────────│
 *   │                   │  [Scrollable     │
 *   │                   │   Main Content]  │
 *   └──────────────────────────────────────┘
 */
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0b1326] overflow-hidden">

      {/* ── FIXED SIDEBAR (desktop) ──────────────────── */}
      {/* Always visible on lg+, hidden but slideable on mobile */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── MOBILE OVERLAY ───────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── RIGHT COLUMN (navbar + content) ─────────── */}
      {/* lg:pl-72 reserves space for the fixed sidebar on desktop */}
      <div className="flex flex-1 flex-col min-w-0 lg:pl-72">

        {/* ── STICKY TOP NAVBAR ──────────────────────── */}
        {/* sticky top-0 keeps it locked while the content below scrolls */}
        <div className="sticky top-0 z-30">
          <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* ── SCROLLABLE MAIN CONTENT ────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1440px] p-4 sm:p-6 md:p-8 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}