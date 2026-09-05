// src/components/ui/PremiumTabSwitcher.tsx
"use client";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  hiddenOnMobile?: boolean;
}

interface PremiumTabSwitcherProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function PremiumTabSwitcher({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: PremiumTabSwitcherProps) {
  return (
    <div className={`relative w-full sm:w-auto ${className}`}>
      {/* Tab Container */}
      <div 
        className="relative z-10 flex w-full sm:w-auto flex-nowrap items-center gap-2 sm:gap-1 overflow-x-auto scrollbar-hide pb-1 -mb-1"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`
                group relative flex-1 sm:flex-none flex items-center justify-center 
                px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap
                transition-all duration-300 ease-out cursor-pointer touch-manipulation
                ${tab.hiddenOnMobile ? "hidden md:flex" : "flex"}
              `}
            >
              {Icon && (
                <Icon 
                  size={18} 
                  className={`
                    mr-2 transition-all duration-300
                    ${isActive 
                      ? "text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(139,92,246,0.5)] scale-110" 
                      : "text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] opacity-70 group-hover:opacity-100"
                    }
                  `} 
                />
              )}
              
              <span 
                className={`
                  relative z-10 transition-all duration-300
                  ${isActive 
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/80 font-extrabold" 
                    : "text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] font-semibold"
                  }
                `}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* ✅ REMOVED: No bottom border line here to match other pages */}
    </div>
  );
}

export default PremiumTabSwitcher;
