"use client";
import React from "react";
import { Calendar, Clock, Car, User, WarningCircle as AlertCircle } from "@phosphor-icons/react/ssr";
import Badge from "./Badge";

interface Booking {
  id: string | number;
  clientName: string;
  vehicleName: string;
  vehiclePlate: string;
  startDate: string;
  endDate: string;
  status: "active" | "upcoming" | "overdue";
  daysUntilStart?: number;
  amount: number;
  currency: string;
}

interface UpcomingBookingsProps {
  bookings: Booking[];
  onViewAll?: () => void;
}

export default function UpcomingBookings({ bookings, onViewAll }: UpcomingBookingsProps) {
  const getStatusConfig = (status: Booking["status"]) => {
    switch (status) {
      case "active":
        return {
          badge: "success" as const,
          label: "Active",
          icon: Clock,
          iconColor: "text-success",
        };
      case "overdue":
        return {
          badge: "danger" as const,
          label: "Overdue",
          icon: AlertCircle,
          iconColor: "text-danger",
        };
      default:
        return {
          badge: "accent" as const,
          label: "Upcoming",
          icon: Calendar,
          iconColor: "text-accent-dark",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink">Active & Upcoming Bookings</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-accent-dark hover:text-accent-darker font-medium"
          >
            View all
          </button>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="py-8 text-center">
          <Calendar size={32} className="mx-auto text-ink-subtle mb-2" aria-hidden="true" />
          <p className="text-sm text-ink-muted">No bookings</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const config = getStatusConfig(booking.status);

            return (
              <div
                key={booking.id}
                className="p-3 rounded-xl bg-surface border border-surface-border hover:border-accent/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.iconColor} bg-surface-hover`}>
                      <Car size={16} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink group-hover:text-accent-dark transition-colors">
                        {booking.vehicleName}
                      </p>
                      <p className="text-xs text-ink-muted">{booking.vehiclePlate}</p>
                    </div>
                  </div>
                  <Badge variant={config.badge} size="xs">
                    {config.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <User size={12} aria-hidden="true" />
                    <span className="truncate">{booking.clientName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-border">
                  <div className="flex items-center gap-1.5 text-xs text-ink-subtle">
                    <Calendar size={12} aria-hidden="true" />
                    <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                  </div>
                  {booking.daysUntilStart !== undefined && booking.status === "upcoming" && (
                    <span className={`text-xs font-medium ${
                      booking.daysUntilStart <= 1 ? "text-danger" : "text-ink-muted"
                    }`}>
                      {booking.daysUntilStart === 0 ? "Today" : 
                       booking.daysUntilStart === 1 ? "Tomorrow" : 
                       `${booking.daysUntilStart} days`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
