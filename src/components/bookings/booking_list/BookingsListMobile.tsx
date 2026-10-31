// src/components/bookings/booking_list/BookingsListMobile.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import CardGrid from "@/components/ui/CardGrid";
import type { Booking, Client, Vehicle } from "@/lib/types";
import { getBookingActions, type BookingActionsContext } from "./getBookingActions";
import { NewBookingFab } from "@/components/bookings/NewBookingButton";
import { invoicesApi } from "@/lib/api/invoices";
import BookingToolbar from "./mobile/BookingToolbar";
import BookingBanner from "./mobile/BookingBanner";
import BookingRow from "./mobile/BookingRow";
import { buildPaymentPill } from "./mobile/helpers";
import type { PaymentSnapshot } from "./mobile/types";

interface BookingsListMobileProps {
  bookings: Booking[];
  clientMap: Map<number, Client>;
  vehicleMap: Map<number, Vehicle>;
  actionsCtx: Omit<BookingActionsContext, "routerPush">;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  statusOptions: { label: string; value: string; count?: number }[];
  activeTab: string;
  handleTabChange: (tab: string) => void;
}

const getClient = (map: Map<number, Client>, id: number) =>
  map.get(id) || map.get(Number(id));
const getVehicle = (map: Map<number, Vehicle>, id: number) =>
  map.get(id) || map.get(Number(id));

export default function BookingsListMobile({
  bookings,
  clientMap,
  vehicleMap,
  actionsCtx,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  statusOptions,
}: BookingsListMobileProps) {
  const router = useRouter();

  const fullCtx: BookingActionsContext = {
    ...actionsCtx,
    routerPush: (h) => router.push(h),
  };
  const getRowActions = (b: Booking) => getBookingActions(b, fullCtx);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // ✅ Payment data (aggregated from invoices, same source as Financials page)
  const [paymentMap, setPaymentMap] = useState<Map<number, PaymentSnapshot>>(new Map());

  useEffect(() => {
    invoicesApi
      .list({ page_size: 200 })
      .then((invoices) => {
        const map = new Map<number, PaymentSnapshot>();
        (invoices || []).forEach((inv: any) => {
          if (!inv.booking_id) return;
          const existing = map.get(inv.booking_id);
          if (!existing) {
            map.set(inv.booking_id, {
              amount_paid: Number(inv.amount_paid || 0),
              amount_due: Number(inv.amount_due || 0),
              status: inv.status,
            });
          } else {
            existing.amount_paid += Number(inv.amount_paid || 0);
            existing.amount_due += Number(inv.amount_due || 0);
            if (inv.status === "paid") existing.status = "paid";
            else if (inv.status === "partially_paid" && existing.status !== "paid") {
              existing.status = "partially_paid";
            }
          }
        });
        setPaymentMap(map);
      })
      .catch((err) =>
        console.error("Failed to fetch invoices for payment pills:", err)
      );
  }, []);

  const hasActiveFilter = statusFilter !== null && statusFilter !== "";
  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === "pending").length,
    [bookings]
  );

  const sortedBookings = useMemo(() => {
    const priority: Record<string, number> = {
      active: 1,
      confirmed: 2,
      pending: 3,
      completed: 4,
      cancelled: 5,
    };

    return [...bookings].sort((a, b) => {
      const aPriority = priority[a.status] ?? 99;
      const bPriority = priority[b.status] ?? 99;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      const aDate = new Date(a.start_date).getTime();
      const bDate = new Date(b.start_date).getTime();
      return bDate - aDate;
    });
  }, [bookings]);

  return (
    <div className="block md:hidden relative min-h-screen">
      <BookingToolbar
        search={search}
        setSearch={setSearch}
        onSearchFocus={() => setSearchFocused(true)}
        onSearchBlur={() => setTimeout(() => setSearchFocused(false), 150)}
        searchFocused={searchFocused}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        hasActiveFilter={hasActiveFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusOptions={statusOptions}
      />

      <BookingBanner
        search={search}
        pendingCount={pendingCount}
        visibleCount={sortedBookings.length}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        hasActiveFilter={hasActiveFilter}
        hidden={searchFocused}
      />

      {/* Card List */}
      <div className="pb-4">
        {sortedBookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <CalendarDays size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
              No bookings found
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              {search || hasActiveFilter
                ? "Try adjusting your search query or filters."
                : "Create your first booking to get started."}
            </p>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => setStatusFilter(null)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] first:rounded-t-2xl last:rounded-b-2xl">
            {sortedBookings.map((item, index) => {
              const client = getClient(clientMap, item.client_id);
              const vehicle = getVehicle(vehicleMap, item.vehicle_id);
              const paymentPill = buildPaymentPill(
                Number(item.total_amount || 0),
                paymentMap.get(item.id)
              );

              return (
                <BookingRow
                  key={item.id}
                  item={item}
                  index={index}
                  total={sortedBookings.length}
                  client={client}
                  vehicle={vehicle}
                  paymentPill={paymentPill}
                  onClick={() => {
                    const trigger = document.querySelector(
                      `[data-card-actions="${item.id}"] button`
                    ) as HTMLButtonElement | null;
                    trigger?.click();
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden CardGrid for action sheets */}
      <div className="hidden">
        <CardGrid
          data={sortedBookings}
          getCardId={(booking) => booking.id}
          compact={true}
          onCardClick={() => {}}
          cardClassName="!p-0"
          containerClassName="!p-0"
          renderCardHeader={() => <div className="hidden" />}
          renderCardBody={() => null}
          rowActions={getRowActions}
        />
      </div>

      {/* FAB */}
      {!searchFocused && <NewBookingFab />}
    </div>
  );
}
