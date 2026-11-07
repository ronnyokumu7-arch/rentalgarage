"use client";
import React, { useState, useRef, useEffect } from "react";
import { MagnifyingGlass as Search, Check } from "@phosphor-icons/react/ssr";

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[]; // List of predictions
  placeholder?: string;
  label?: string;
}

export default function SmartInput({
  value,
  onChange,
  options,
  placeholder = "Type to search...",
  label,
}: SmartInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter options based on input
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(value.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredOptions[activeIndex]);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" aria-hidden="true"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-surface-border bg-surface-card text-ink
            py-2.5 pl-10 pr-3.5 text-[0.9375rem] outline-none transition-all
            focus:border-accent-dark focus:ring-4 focus:ring-accent-bg/20"
        />
      </div>

      {/* Premium Dropdown */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-surface-card border border-surface-border rounded-xl shadow-[var(--shadow-dropdown)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition-colors
                  ${index === activeIndex ? "bg-accent-bg text-accent-dark" : "text-ink hover:bg-surface-hover"}
                `}
              >
                <span>{option}</span>
                {value === option && <Check size={14} className="text-accent-dark" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
