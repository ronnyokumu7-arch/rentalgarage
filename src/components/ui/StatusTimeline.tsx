import React from "react";
import { Check, Clock, Circle } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

interface TimelineStep {
  label: string;
  description?: string;
  timestamp?: string;
  status: "completed" | "current" | "pending";
  icon?: Icon;
}

interface StatusTimelineProps {
  steps: TimelineStep[];
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export default function StatusTimeline({
  steps,
  orientation = "vertical",
  className = "",
}: StatusTimelineProps) {
  if (orientation === "horizontal") {
    return (
      <div className={`flex items-start justify-between gap-2 ${className}`}>
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isLast = i === steps.length - 1;

          return (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-0.5
                    ${step.status === "completed" ? "bg-accent-dark" : "bg-surface-border"}
                  `}
                />
              )}

              {/* Step circle */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                  transition-colors
                  ${
                    step.status === "completed"
                      ? "bg-accent-dark text-white"
                      : step.status === "current"
                      ? "bg-accent-bg text-accent-dark ring-2 ring-accent-dark"
                      : "bg-surface-hover text-ink-subtle"
                  }
                `}
              >
                {step.status === "completed" ? (
                  <Check size={14} weight="bold" aria-hidden="true" />
                ) : step.status === "current" ? (
                  Icon ? <Icon size={14} weight="regular" aria-hidden="true" /> : <Clock size={14} weight="regular" aria-hidden="true" />
                ) : (
                  Icon ? <Icon size={14} weight="regular" aria-hidden="true" /> : <Circle size={14} weight="regular" aria-hidden="true" />
                )}
              </div>

              {/* Label */}
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-medium ${
                    step.status === "pending" ? "text-ink-subtle" : "text-ink"
                  }`}
                >
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="text-[10px] text-ink-subtle mt-0.5">
                    {step.timestamp}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical orientation (default)
  return (
    <div className={`flex flex-col ${className}`}>
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isLast = i === steps.length - 1;

        return (
          <div key={i} className="relative flex gap-4">
            {/* Vertical line */}
            {!isLast && (
              <div
                className={`absolute left-[15px] top-8 bottom-0 w-0.5
                  ${step.status === "completed" ? "bg-accent-dark" : "bg-surface-border"}
                `}
              />
            )}

            {/* Step circle */}
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${
                  step.status === "completed"
                    ? "bg-accent-dark text-white"
                    : step.status === "current"
                    ? "bg-accent-bg text-accent-dark ring-2 ring-accent-dark"
                    : "bg-surface-hover text-ink-subtle"
                }
              `}
            >
              {step.status === "completed" ? (
                <Check size={14} weight="bold" aria-hidden="true" />
              ) : step.status === "current" ? (
                Icon ? <Icon size={14} weight="regular" aria-hidden="true" /> : <Clock size={14} weight="regular" aria-hidden="true" />
              ) : (
                Icon ? <Icon size={14} weight="regular" aria-hidden="true" /> : <Circle size={14} weight="regular" aria-hidden="true" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${isLast ? "pb-0" : "pb-6"}`}>
              <p
                className={`text-sm font-medium ${
                  step.status === "pending" ? "text-ink-subtle" : "text-ink"
                }`}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-ink-muted mt-0.5">{step.description}</p>
              )}
              {step.timestamp && (
                <p className="text-xs text-ink-subtle mt-1">{step.timestamp}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}