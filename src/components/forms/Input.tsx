// src/components/forms/Input.tsx
import React from "react";
import type { Icon } from "@phosphor-icons/react";

// ✅ FIXED: Use Omit to remove the native HTML 'size' attribute (which expects a number)
// so we can safely define our own custom 'size' prop (which expects "sm" | "md" | "lg")
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  icon?: Icon;
  error?: string;
  size?: "sm" | "md" | "lg";
}

export default function Input({
  icon: Icon,
  error,
  size = "md",
  className = "",
  ...props
}: InputProps) {
  const sizeClasses = {
    sm: "h-8 text-xs px-2.5",
    md: "h-10 text-sm px-3",
    lg: "h-12 text-base px-4",
  };

  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Icon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} className="text-gray-400" aria-hidden="true" />
        </div>
      )}
      <input
        {...props}
        className={`
          w-full rounded-lg border bg-white outline-none transition-all
          ${error ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"}
          ${sizeClasses[size]}
          ${Icon ? "pl-9" : ""}
          ${className}
        `}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
