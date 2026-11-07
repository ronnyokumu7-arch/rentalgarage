import React, { forwardRef } from "react";
import { CaretDown as ChevronDown } from "@phosphor-icons/react/ssr";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, error, placeholder, className = "", ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={`
            w-full rounded-lg border bg-surface-card text-ink
            transition-all duration-200 outline-none appearance-none cursor-pointer
            py-2.5 pl-3.5 pr-10 text-[0.9375rem]
            ${
              error
                ? "border-danger focus:border-danger focus:ring-4 focus:ring-danger/10"
                : "border-surface-border hover:border-surface-border-strong focus:border-accent-dark focus:ring-4 focus:ring-accent-bg/20"
            }
            disabled:bg-surface-hover disabled:cursor-not-allowed
            ${!props.value && placeholder ? "text-ink-subtle" : ""}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" aria-hidden="true"
        />
      </div>
    );
  }
);
Select.displayName = "Select";
export default Select;
