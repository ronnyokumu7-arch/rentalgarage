// src/components/public-docs/PublicDocActions.tsx
import React from "react";
import { Loader2 } from "lucide-react";

interface ActionButton {
  label: string;
  onClick: () => void;
  variant: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface PublicDocActionsProps {
  actions: ActionButton[];
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)',
    color: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(109, 40, 217, 0.25)',
  },
  secondary: {
    background: '#FFFFFF',
    color: '#44403C',
    border: '1px solid rgba(28, 25, 23, 0.10)',
  },
  danger: {
    background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    color: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(185, 28, 28, 0.25)',
  },
};

const hoverStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #5B21B6 0%, #4C1D95 100%)',
    boxShadow: '0 6px 16px rgba(109, 40, 217, 0.35)',
  },
  secondary: {
    background: '#F5F3F0',
    borderColor: 'rgba(28, 25, 23, 0.18)',
  },
  danger: {
    background: 'linear-gradient(135deg, #B91C1C 0%, #991B1B 100%)',
    boxShadow: '0 6px 16px rgba(185, 28, 28, 0.35)',
  },
};

export default function PublicDocActions({ actions }: PublicDocActionsProps) {
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 p-4 sm:static sm:p-0 sm:rounded-2xl"
      style={{
        background: 'rgba(255, 255, 255, 0.80)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(28, 25, 23, 0.10)',
        // Reset for sm+
      }}
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              ...variantStyles[action.variant],
              cursor: action.disabled || action.loading ? 'not-allowed' : 'pointer',
              opacity: action.disabled || action.loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!action.disabled && !action.loading) {
                Object.assign(e.currentTarget.style, hoverStyles[action.variant]);
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, variantStyles[action.variant]);
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {action.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* Desktop-only styles via style tag */}
      <style jsx>{`
        @media (min-width: 640px) {
          .fixed {
            position: static !important;
            background: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border-top: none !important;
            padding: 0 !important;
            border-radius: 1rem !important;
            border: 1px solid rgba(28, 25, 23, 0.10) !important;
            box-shadow: 0 1px 3px rgba(28, 25, 23, 0.08) !important;
          }
        }
      `}</style>
    </div>
  );
}
