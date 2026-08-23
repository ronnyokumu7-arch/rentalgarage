// src/components/dashboard/ActionCenterWidget.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, UserPlus, Calendar, Clock, ArrowRight,
  Zap, Sparkles, Loader2, MoreVertical,
  Play, XCircle, Eye, Car, User, FileText, MapPin,
  CalendarDays, ChevronRight, DollarSign
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import toast from "react-hot-toast";

import { useActionCenterTasks } from "@/hooks/dashboard/useActionCenterTasks";
import { useRecentActivity } from "@/hooks/dashboard/useRecentActivity";
import { bookingsApi } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types";

type SubTab = "tasks" | "bookings" | "activity";

const HEADER_COPY: Record<SubTab, { title: string; description: string; icon: LucideIcon; iconClassName?: string }> = {
  tasks: { title: "Active Tasks", description: "What needs your attention today", icon: Zap },
  bookings: { title: "Upcoming Rentals", description: "Track latest trips & late returns", icon: Calendar, iconClassName: "scale-y-90" },
  activity: { title: "Activity Logs", description: "The live pulse of your fleet's latest moves.", icon: Clock },
};

const BOOKING_STATUS_META: Record<string, { label: string; badge: string; dot: string }> = {
  pending:   { label: "Pending",   badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",     dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",         dot: "bg-blue-500" },
  active:    { label: "Active",    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500" },
  awaiting_mileage: { label: "Awaiting Mileage", badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", dot: "bg-orange-500" },
  completed: { label: "Completed", badge: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",      dot: "bg-slate-400" },
  cancelled: { label: "Cancelled", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",          dot: "bg-rose-500" },
  no_show:   { label: "No Show",   badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",          dot: "bg-rose-500" },
};

const resolveField = (value: any, ...objectKeys: string[]): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    for (const key of objectKeys) if (value[key]) return String(value[key]);
    if (value.make && value.model) return `${value.make} ${value.model}${value.plate_number ? ` • ${value.plate_number}` : ""}`;
    if (value.full_name) return value.full_name;
    if (value.name) return value.name;
  }
  return String(value);
};

const getInitials = (name?: string | null) =>
  name ? name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() : "?";

const rentalDays = (start?: string | null, end?: string | null): number | null => {
  if (!start || !end) return null;
  const d = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
  return isNaN(d) ? null : Math.max(1, d);
};

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const parseTaskTitle = (title: string): { action: string; subject: string | null } => {
  const separators = [' for ', ' with ', ' regarding ', ' on ', ' about '];
  for (const sep of separators) {
    const idx = title.toLowerCase().indexOf(sep.toLowerCase());
    if (idx !== -1) return { action: title.substring(0, idx).trim(), subject: title.substring(idx + sep.length).trim() };
  }
  return { action: title, subject: null };
};

const getSubjectIcon = (subject: string): LucideIcon => {
  const lower = subject.toLowerCase();
  if (lower.includes('vehicle') || lower.includes('car') || lower.includes('plate') ||
      lower.includes('toyota') || lower.includes('nissan') || lower.includes('mazda') ||
      /\b[km][a-z]\d{3}[a-z]\b/i.test(subject)) return Car;
  if (lower.includes('booking') || lower.includes('rental') || lower.includes('trip') ||
      lower.includes('reservation') || /^bk-\d+$/i.test(subject)) return Calendar;
  if (lower.includes('document') || lower.includes('contract') || lower.includes('invoice') ||
      lower.includes('receipt') || lower.includes('agreement')) return FileText;
  return User;
};

export default function ActionCenterWidget() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("bookings");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [actingBookingId, setActingBookingId] = useState<number | null>(null);
  const [openBookingMenuId, setOpenBookingMenuId] = useState<number | null>(null);

  const { tasks, loading: tasksLoading, handleClaim, handleComplete } = useActionCenterTasks();
  const { activities, loading: activityLoading } = useRecentActivity();

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const items = await bookingsApi.list({ page_size: 50 });
      const upcoming = items
        .filter((b) => ["pending", "confirmed", "active"].includes(b.status))
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
      setBookings(upcoming.slice(0, 8));
    } catch (e) {
      console.error("Failed to load upcoming bookings:", e);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (openMenuId !== null && !target.closest("[data-task-menu]")) setOpenMenuId(null);
      if (openBookingMenuId !== null && !target.closest("[data-booking-menu]")) setOpenBookingMenuId(null);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [openMenuId, openBookingMenuId]);

  const subTabs = [
    { id: "bookings" as SubTab, label: "Rentals", count: bookings.length },
    { id: "activity" as SubTab, label: "Activity", count: activities.length },
    { id: "tasks" as SubTab, label: "Tasks", count: tasks.length },
  ];

  const headerCopy = HEADER_COPY[activeSubTab];
  const HeaderIcon = headerCopy.icon;

  const getPriorityDotColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'bg-rose-500 shadow-sm shadow-rose-500/50';
      case 'high': return 'bg-amber-500 shadow-sm shadow-amber-500/50';
      case 'medium': return 'bg-blue-500 shadow-sm shadow-blue-500/50';
      default: return 'bg-[var(--color-ink-subtle)]';
    }
  };

  const isOverdue = (dateStr: string) => !!dateStr && new Date(dateStr) < new Date();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "No due date";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleClaimTask = async (rawId: any) => {
    const taskId = Number(rawId);
    if (!taskId || isNaN(taskId)) { toast.error("Invalid task ID"); return; }
    setUpdatingId(taskId); await handleClaim(taskId); setUpdatingId(null);
  };

  const handleCompleteTask = async (rawId: any) => {
    const taskId = Number(rawId);
    if (!taskId || isNaN(taskId)) { toast.error("Invalid task ID"); return; }
    setUpdatingId(taskId); await handleComplete(taskId); setUpdatingId(null);
  };

  const handleBookingAction = async (id: number, action: "confirm" | "activate" | "complete" | "cancel") => {
    setActingBookingId(id); setOpenBookingMenuId(null);
    const successMessages = {
      confirm: "Booking confirmed 🎉",
      activate: "Trip started — vehicle is now active",
      complete: "Trip completed",
      cancel: "Booking cancelled",
    };
    try {
      await bookingsApi[action](id);
      toast.success(successMessages[action]);
      await fetchBookings();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Action failed. Try again.");
    } finally {
      setActingBookingId(null);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden h-full flex flex-col">
      
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-[var(--color-surface-border)] bg-gradient-to-r from-[var(--color-surface-hover)] to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)]/80 flex items-center justify-center text-white shadow-md shadow-[var(--color-primary)]/20">
              <HeaderIcon size={16} className={headerCopy.iconClassName} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-ink)] tracking-tight flex items-center gap-2">
                {headerCopy.title}
                <Sparkles size={11} className="text-[var(--color-primary)] opacity-70" />
              </h3>
              <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">{headerCopy.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] max-w-full overflow-x-auto">
              {subTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap ${
                    activeSubTab === tab.id ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                      activeSubTab === tab.id ? "bg-white/20 text-white" : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]"
                    } ${activeSubTab === tab.id ? "hidden sm:inline" : "inline"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 sm:p-3 max-h-80 space-y-2">
        
        {/* RENTALS - COMPACT PREMIUM CARDS */}
        {activeSubTab === "bookings" && (
          <div className="space-y-2 animate-in fade-in duration-200">
            {bookingsLoading ? (
              <div className="flex flex-col items-center justify-center py-6 text-[var(--color-ink-muted)] text-sm">
                <Loader2 size={18} className="animate-spin mb-2 text-[var(--color-primary)]" />
                Loading rentals...
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                  <Calendar size={18} />
                </div>
                <p className="text-sm font-bold text-[var(--color-ink)]">No upcoming rentals</p>
                <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">Scheduled rentals will appear here.</p>
              </div>
            ) : (
              bookings.map((booking) => {
                const meta = BOOKING_STATUS_META[booking.status] || BOOKING_STATUS_META.pending;
                const clientName = resolveField(booking.client, "full_name", "name") || "Customer";
                const vehicle = booking.vehicle;
                const plate = vehicle?.plate_number || null;
                const vehicleLabel = vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle";
                const days = rentalDays(booking.start_date, booking.end_date);
                const destination = resolveField(booking.destination, "name", "destination");
                const tripOverdue = booking.status === "active" && isOverdue(booking.end_date);
                const isActive = booking.status === "active";
                const isPending = booking.status === "pending";
                const isConfirmed = booking.status === "confirmed";

                return (
                  <div 
                    key={`booking-${booking.id}`} 
                    className="group relative rounded-xl overflow-hidden border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-md transition-all duration-300"
                  >
                    {/* Premium Gradient Accent Bar - Thinner */}
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
                      isActive ? 'from-emerald-400 to-emerald-600' :
                      isConfirmed ? 'from-blue-400 to-blue-600' :
                      isPending ? 'from-amber-400 to-amber-600' :
                      'from-gray-400 to-gray-600'
                    }`} />
                    
                    <div className="p-3 pt-3.5">
                      {/* Row 1: Client + Status + Menu */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {/* Compact Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${
                              isActive ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                              isConfirmed ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                              isPending ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                              'bg-gradient-to-br from-gray-500 to-gray-600'
                            } shadow-sm ring-2 ring-[var(--color-surface)]`}>
                              {getInitials(clientName)}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5">
                              <div className={`w-2.5 h-2.5 rounded-full ${meta.dot} ring-2 ring-[var(--color-surface)] ${
                                isActive ? 'animate-pulse' : ''
                              }`} />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-[var(--color-ink)] truncate">
                                {clientName}
                              </p>
                              {isActive && (
                                <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[7px] font-extrabold uppercase tracking-wider border border-emerald-500/20">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                  LIVE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Car size={9} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                              <span className="text-[9px] font-medium text-[var(--color-ink-muted)] truncate">
                                {vehicleLabel}
                              </span>
                              {plate && (
                                <>
                                  <span className="text-[8px] text-[var(--color-ink-subtle)]">•</span>
                                  <span className="text-[8px] font-mono font-semibold text-[var(--color-ink)]">
                                    {plate}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Kebab menu */}
                        <div className="relative flex-shrink-0" data-booking-menu>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenBookingMenuId(openBookingMenuId === booking.id ? null : booking.id); }}
                            className="p-1 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all active:scale-95"
                            aria-label="Booking actions"
                          >
                            {actingBookingId === booking.id ? <Loader2 size={12} className="animate-spin" /> : <MoreVertical size={12} />}
                          </button>

                          {openBookingMenuId === booking.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-lg shadow-black/5 z-20 overflow-hidden animate-in fade-in slide-up duration-150">
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenBookingMenuId(null); router.push(`/dashboard/bookings/${booking.id}`); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                              >
                                <Eye size={12} /> View Booking
                              </button>
                              {isPending && (
                                <button onClick={(e) => { e.stopPropagation(); handleBookingAction(booking.id, "confirm"); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors border-t border-[var(--color-surface-border)]">
                                  <CheckCircle2 size={12} /> Confirm Booking
                                </button>
                              )}
                              {isConfirmed && (
                                <button onClick={(e) => { e.stopPropagation(); handleBookingAction(booking.id, "activate"); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]">
                                  <Play size={12} /> Start Trip
                                </button>
                              )}
                              {isActive && (
                                <button onClick={(e) => { e.stopPropagation(); handleBookingAction(booking.id, "complete"); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]">
                                  <CheckCircle2 size={12} /> End Trip
                                </button>
                              )}
                              {(isPending || isConfirmed) && (
                                <button onClick={(e) => { e.stopPropagation(); handleBookingAction(booking.id, "cancel"); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-[var(--color-surface-border)]">
                                  <XCircle size={12} /> Cancel Booking
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Stats Grid - Ultra Compact */}
                      <div className="grid grid-cols-3 gap-1.5 mt-2 pt-1.5 border-t border-[var(--color-surface-border)]/40">
                        {/* Days */}
                        <div className="flex items-center gap-1">
                          <CalendarDays size={9} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-[var(--color-ink)] leading-tight">
                              {days || 0}d
                            </p>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-1">
                          <Clock size={9} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-[var(--color-ink)] leading-tight truncate">
                              {formatDateShort(booking.start_date)}
                            </p>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center gap-1 justify-end">
                          <DollarSign size={9} className="text-[var(--color-primary)] flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-[var(--color-primary-text)] leading-tight tabular-nums truncate">
                              {Number(booking.total_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Status + Destination + Actions */}
                      <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-[var(--color-surface-border)]/40">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] font-extrabold uppercase tracking-wider ${meta.badge}`}>
                            <span className={`w-1 h-1 rounded-full ${meta.dot} ${isActive ? 'animate-pulse' : ''}`} />
                            {meta.label}
                          </span>
                          {tripOverdue && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[7px] font-extrabold uppercase tracking-wider border border-rose-500/20">
                              <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                              Overdue
                            </span>
                          )}
                          {destination && (
                            <span className="flex items-center gap-0.5 min-w-0">
                              <MapPin size={8} className="text-[var(--color-primary)] flex-shrink-0" />
                              <span className="text-[8px] font-medium text-[var(--color-ink-muted)] truncate">
                                {destination}
                              </span>
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                          className="inline-flex items-center gap-0.5 text-[8px] font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity group flex-shrink-0"
                        >
                          Details
                          <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ACTIVITY */}
        {activeSubTab === "activity" && (
          <div className="space-y-2 animate-in fade-in duration-200">
            {activityLoading ? (
              <div className="flex flex-col items-center justify-center py-6 text-[var(--color-ink-muted)] text-sm">
                <Loader2 size={18} className="animate-spin mb-2 text-[var(--color-primary)]" />
                Loading activity...
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                  <Clock size={18} />
                </div>
                <p className="text-sm font-bold text-[var(--color-ink)]">No recent activity</p>
                <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">Recent fleet moves will be logged here.</p>
              </div>
            ) : (
              activities.map((activity: any) => (
                <div key={`activity-${activity.id}`} className="p-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-sm transition-all duration-200 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center flex-shrink-0 text-[var(--color-primary)]">
                    <Clock size={12} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-[var(--color-ink)] leading-snug">
                      {activity.title || activity.description || activity.action}
                    </p>
                    {activity.timestamp && (
                      <p className="text-[8px] text-[var(--color-ink-muted)] mt-0.5 font-medium">{formatDate(activity.timestamp)}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TASKS */}
        {activeSubTab === "tasks" && (
          <div className="space-y-2 animate-in fade-in duration-200">
            {tasksLoading ? (
              <div className="flex flex-col items-center justify-center py-6 text-[var(--color-ink-muted)] text-sm">
                <Loader2 size={18} className="animate-spin mb-2 text-[var(--color-primary)]" />
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <CheckCircle2 size={18} />
                </div>
                <p className="text-sm font-bold text-[var(--color-ink)]">All caught up!</p>
                <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">No pending tasks right now.</p>
              </div>
            ) : (
              tasks.map((task) => {
                const overdue = task.due_date ? isOverdue(task.due_date) : false;
                const safeTaskId = (task as any).id ?? (task as any).task_id;
                const hasActions = task.status !== "completed";
                const { action, subject } = parseTaskTitle(task.title);
                const SubjectIcon = subject ? getSubjectIcon(subject) : null;

                return (
                  <div key={`task-${safeTaskId}`} className="group relative p-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ring-2 ring-[var(--color-surface)] ${getPriorityDotColor(task.priority)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold leading-tight text-[var(--color-ink)]">{action}</p>
                        {subject && SubjectIcon && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <SubjectIcon size={10} className="text-[var(--color-ink-muted)] flex-shrink-0" />
                            <span className="text-[9px] text-[var(--color-ink-muted)] truncate">{subject}</span>
                          </div>
                        )}
                        {task.due_date && (
                          <span className={`flex items-center gap-1 mt-0.5 text-[8px] font-bold uppercase tracking-wider ${overdue ? "text-rose-600 dark:text-rose-400" : "text-[var(--color-ink-subtle)]"}`}>
                            <Calendar size={9} />
                            {formatDate(task.due_date)}
                            {overdue && <span className="ml-1 px-1 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[7px] font-extrabold">OVERDUE</span>}
                          </span>
                        )}
                      </div>

                      {hasActions && (
                        <div className="relative flex-shrink-0" data-task-menu>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === safeTaskId ? null : safeTaskId); }}
                            className="p-1 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all active:scale-95"
                            aria-label="Task actions"
                          >
                            {updatingId === safeTaskId ? <Loader2 size={12} className="animate-spin" /> : <MoreVertical size={12} />}
                          </button>
                          {openMenuId === safeTaskId && (
                            <div className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-lg shadow-black/5 z-20 overflow-hidden animate-in fade-in slide-up duration-150">
                              {task.status === "unassigned" && (
                                <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleClaimTask(safeTaskId); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">
                                  <UserPlus size={12} /> Claim Task
                                </button>
                              )}
                              {task.status !== "unassigned" && task.status !== "completed" && (
                                <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleCompleteTask(safeTaskId); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                                  <CheckCircle2 size={12} /> Mark Complete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-3 py-2 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-center">
        <button
          onClick={() => router.push(`/dashboard/${activeSubTab === "bookings" ? "bookings" : activeSubTab}`)}
          className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity"
        >
          View all {headerCopy.title}
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
