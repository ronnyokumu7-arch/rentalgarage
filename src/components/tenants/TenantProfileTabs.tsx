// src/components/tenants/TenantProfileTabs.tsx
import { Buildings as Building2, CreditCard, Pulse as Activity } from "@phosphor-icons/react/ssr"; // ✅ Changed Settings to Activity
import { type TenantProfileTab } from '@/hooks/useTenantProfile';

interface TenantProfileTabsProps {
  activeTab: TenantProfileTab;
  setActiveTab: (tab: TenantProfileTab) => void;
}

const tabs = [
  { id: 'profile' as TenantProfileTab, label: 'Agency Profile', icon: Building2 },
  { id: 'subscription' as TenantProfileTab, label: 'Subscription', icon: CreditCard },
  { id: 'health' as TenantProfileTab, label: 'Health', icon: Activity }, // ✅ Renamed & new icon
];

export function TenantProfileTabs({ activeTab, setActiveTab }: TenantProfileTabsProps) {
  return (
    <div className="border-b border-[var(--color-surface-border)] bg-[var(--color-surface)] px-6 md:px-8">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 text-sm font-medium border-b-2 transition-all duration-200
                ${isActive 
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                  : 'border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink-subtle)]'}
              `}
            >
              <Icon 
                className={`
                  -ml-0.5 mr-2 h-5 w-5 transition-colors
                  ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink-muted)]'}
                `} aria-hidden="true"
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
