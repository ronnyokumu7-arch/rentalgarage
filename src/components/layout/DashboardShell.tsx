"use client";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";
import Topbar from "./TopBar";
import BottomNav from "./BottomNav";
import type { NavItem } from "@/lib/nav-config";

interface DashboardShellProps {
  children: ReactNode;
  navItems: NavItem[];
}

export default function DashboardShell({ children, navItems }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-surface text-ink flex">
      {/* Global Toast Provider - Premium Positioning */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: "!bg-surface-card !text-ink !border !border-surface-border !shadow-[var(--shadow-dropdown)]",
        }} 
      />

      {/* Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-[72px]">
        <Sidebar navItems={navItems} />
      </div>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[72px]">
        {/* Sticky Topbar */}
        <Topbar />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav (Hidden on Desktop) */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <BottomNav navItems={navItems} />
      </div>
    </div>
  );
}
