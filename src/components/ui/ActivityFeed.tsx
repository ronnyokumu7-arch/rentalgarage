"use client";
import React from "react";
import { Calendar } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

interface ActivityItem {
  id: string | number;
  icon: Icon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Calendar size={32} className="text-ink-subtle mb-2" aria-hidden="true" />
        <p className="text-sm text-ink-muted">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-surface-border">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
              <Icon size={16} className={item.iconColor} weight="regular" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{item.title}</p>
              <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{item.description}</p>
            </div>
            <span className="text-xs text-ink-subtle whitespace-nowrap">{item.time}</span>
          </div>
        );
      })}
    </div>
  );
}
