// src/components/public-docs/PublicDocActions.tsx
import React from "react";
import { Loader2 } from "lucide-react";

interface ActionButton {
  label: string;
  onClick?: () => void;
  variant: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface PublicDocActionsProps {
  actions: ActionButton[];
}

const variantStyles = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20",
  secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};

export default function PublicDocActions({ actions }: PublicDocActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:p-0 sm:rounded-2xl sm:shadow-sm sm:border sm:border-slate-200">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[action.variant]}`}
          >
            {action.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
