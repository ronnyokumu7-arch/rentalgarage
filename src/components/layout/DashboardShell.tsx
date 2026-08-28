// src/components/layout/DashboardShell.tsx
"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./TopBar";
import BottomNav from "./BottomNav";
import type { NavItem } from "@/lib/nav-config";

interface DashboardShellProps {
  children: ReactNode;
  navItems: NavItem[];
}

export default function DashboardShell({ children, navItems }: DashboardShellProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // ── Close mobile nav on route change ──────────────────────
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // ── Page transition variants ──────────────────────────────
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 12,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] as const, // ✅ Fixed: Added `as const`
      },
    },
    exit: {
      opacity: 0,
      y: -12,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1] as const, // ✅ Fixed: Added `as const`
      },
    },
  };

  // ── Child variants for staggered animations ──────────────
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen text-ink flex transition-colors duration-300 bg-bg">
      
      {/* ── Desktop Sidebar ────────────────────────────────── */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-[72px]">
        <Sidebar navItems={navItems} />
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[72px]">
        <Topbar onMenuToggle={() => setIsMobileNavOpen(true)} />
        
        {/* ── Page Content with Animations ──────────────────── */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-8"
          >
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              {children}
            </motion.div>
          </motion.main>
        </AnimatePresence>
      </div>

      {/* ── Mobile Bottom Nav ────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNav navItems={navItems} />
      </div>

      {/* ── Mobile Sidebar Overlay ───────────────────────────── */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileNavOpen(false)}
            />
            
            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
              className="fixed top-0 left-0 z-50 w-72 h-full bg-surface border-r border-surface-border shadow-2xl lg:hidden"
            >
              <Sidebar 
                navItems={navItems} 
                isMobile 
                onClose={() => setIsMobileNavOpen(false)} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
