// src/components/fleet/MobileFleetList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import {
  Car, Archive, Shield, Loader2, Ban, Wrench,
  CarFront, Banknote, Pencil, Plus,
} from "lucide-react";
import CardGrid, { RowAction } from "@/components/ui/CardGrid";
import CollectionsModal from "@/components/fleet/CollectionsModal";
import FleetToolbar from "@/components/fleet/mobile/FleetToolbar";
import FleetBanners from "@/components/fleet/mobile/FleetBanners";
import FleetSection from "@/components/fleet/mobile/FleetSection";
import type { FleetSectionData } from "@/components/fleet/mobile/types";
import {
  getCollections,
  type VehicleCollection,
} from "@/lib/collections";
import type { Vehicle, VehicleStatus, Booking } from "@/lib/types";

interface MobileFleetListProps {
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: VehicleStatus | "" | "mileage_due";
  setStatusFilter: (v: VehicleStatus | "" | "mileage_due") => void;
  statusOptions: { label: string; value: string; count: number }[];
  activeTab: string;
  handleTabChange: (tab: string) => void;
  mobileTabs: { id: string; label: string; icon: React.ElementType }[];
  filteredVehicles: Vehicle[];
  activeRentals: Record<number, Booking>;
  setGarageVehicle: (v: Vehicle | null) => void;
  setGarageModalOpen: (open: boolean) => void;
  setPricingVehicle: (v: Vehicle | null) => void;
  setIsPricingModalOpen: (open: boolean) => void;
  setEditVehicle: (v: Vehicle | null) => void;
  setIsEditModalOpen: (open: boolean) => void;
  handleStatusAction: (id: number, action: string) => void;
  handleArchive: (id: number) => void;
  handleRetire: (id: number) => void;
  onAddVehicle: () => void;
}

export default function MobileFleetList({
  loading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  statusOptions,
  activeTab,
  handleTabChange,
  filteredVehicles,
  activeRentals,
  setGarageVehicle,
  setGarageModalOpen,
  setPricingVehicle,
  setIsPricingModalOpen,
  setEditVehicle,
  setIsEditModalOpen,
  handleStatusAction,
  handleArchive,
  handleRetire,
  onAddVehicle,
}: MobileFleetListProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // ─── Selection ────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Vehicle[]>([]);
  const isSelecting = selected.length > 0;
  const selectedIds = useMemo(() => new Set(selected.map((v) => v.id)), [selected]);

  const [searchFocused, setSearchFocused] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ─── Collections ──────────────────────────────────────────────────
  const [collections, setCollections] = useState<VehicleCollection[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [collectionsModalOpen, setCollectionsModalOpen] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);

  const loadCollections = useCallback(() => {
    setCollections(getCollections());
  }, []);

  useEffect(() => {
    loadCollections();
    const handler = () => loadCollections();
    window.addEventListener("rg.collections.changed", handler);
    return () => window.removeEventListener("rg.collections.changed", handler);
  }, [loadCollections]);

  const openCreateCollection = () => {
    setEditingCollectionId(null);
    setCollectionsModalOpen(true);
  };
  const openEditCollection = (id: string) => {
    setEditingCollectionId(id);
    setCollectionsModalOpen(true);
  };
  const toggleSection = (id: string) =>
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));

  // ─── Long press ───────────────────────────────────────────────────
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const longPressStartPos = useRef<{ x: number; y: number } | null>(null);

  const sortedVehicles = useMemo(() => {
    return [...filteredVehicles].sort((a, b) => {
      const aKey = `${a.make} ${a.model}`.toLowerCase();
      const bKey = `${b.make} ${b.model}`.toLowerCase();
      return aKey.localeCompare(bKey);
    });
  }, [filteredVehicles]);

  const clearSelection = () => {
    setSelected([]);
    longPressFired.current = false;
  };

  const toggleSelection = (vehicle: Vehicle) => {
    setSelected((prev) => {
      const exists = prev.some((v) => v.id === vehicle.id);
      if (exists) return prev.filter((v) => v.id !== vehicle.id);
      return [...prev, vehicle];
    });
  };

  const handleTouchStart = (vehicle: Vehicle) => (e: React.TouchEvent) => {
    longPressFired.current = false;
    const touch = e.touches[0];
    if (!touch) return;
    longPressStartPos.current = { x: touch.clientX, y: touch.clientY };

    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      if (!isSelecting) setSelected([vehicle]);
      else toggleSelection(vehicle);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(15);
      }
    }, 450);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!longPressTimer.current || !longPressStartPos.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = Math.abs(touch.clientX - longPressStartPos.current.x);
    const dy = Math.abs(touch.clientY - longPressStartPos.current.y);
    if (dx > 8 || dy > 8) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    if (!isSelecting) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-selection-zone]")) return;
      clearSelection();
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isSelecting]);

  // ─── Batch actions ────────────────────────────────────────────────
  const handleBatchArchive = () => {
    if (selected.length === 0) return;
    selected.forEach((v) => handleArchive(v.id));
    clearSelection();
  };

  const handleBatchMaintenance = () => {
    if (selected.length === 0) return;
    selected.forEach((v) => {
      if (v.status === "available") handleStatusAction(v.id, "maintenance");
    });
    clearSelection();
  };

  const handleBatchMileage = () => {
    if (selected.length === 0) return;
    setGarageVehicle(selected[0]);
    setGarageModalOpen(true);
    clearSelection();
  };

  const handleBatchAddToCollection = () => {
    if (selected.length === 0) return;
    setEditingCollectionId(null);
    setCollectionsModalOpen(true);
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchFocused(false);
    searchInputRef.current?.blur();
  };

  // ─── Row actions ──────────────────────────────────────────────────
  const getVehicleActions = (vehicle: Vehicle): RowAction<Vehicle>[] => {
    const actions: RowAction<Vehicle>[] = [
      {
        label: "Vehicle Profile",
        icon: Car,
        onClick: () => router.push(`/dashboard/fleet/${vehicle.id}`),
      },
    ];

    if (vehicle.is_archived) {
      actions.push({
        label: "Restore Vehicle",
        icon: Archive,
        variant: "primary",
        onClick: () => handleStatusAction(vehicle.id, "restore"),
      });
      return actions;
    }

    actions.push({
      label: "Edit Details",
      icon: Pencil,
      variant: "default",
      onClick: () => {
        setEditVehicle(vehicle);
        setIsEditModalOpen(true);
      },
    });

    if (vehicle.status === "pending_activation") {
      const isInvestorAsset = !!vehicle.owner_id;
      actions.push({
        label: isInvestorAsset ? "Review & Set Pricing" : "Activate Vehicle",
        icon: Shield,
        variant: "primary",
        onClick: () => handleStatusAction(vehicle.id, "activate"),
      });
    } else if (vehicle.owner_id) {
      actions.push({
        label: "Edit Lease Agreement",
        icon: Banknote,
        variant: "default",
        onClick: () => {
          setPricingVehicle(vehicle);
          setIsPricingModalOpen(true);
        },
      });
    }

    if (vehicle.mileage_due || vehicle.status === "maintenance") {
      actions.push({
        label: "Update Mileage",
        icon: Wrench,
        variant: "default",
        onClick: () => {
          setGarageVehicle(vehicle);
          setGarageModalOpen(true);
        },
      });
    }

    if (vehicle.status === "maintenance") {
      actions.push({
        label: "Reactivate Vehicle",
        icon: Shield,
        variant: "primary",
        onClick: () => handleStatusAction(vehicle.id, "reactivate"),
      });
    }

    if (vehicle.status === "available") {
      actions.push({
        label: "Send to Maintenance",
        icon: Shield,
        variant: "default",
        onClick: () => handleStatusAction(vehicle.id, "maintenance"),
      });
    }

    actions.push(
      {
        label: "Quick Garage",
        icon: Wrench,
        variant: "default",
        separator: true,
        onClick: () => {
          setGarageVehicle(vehicle);
          setGarageModalOpen(true);
        },
      },
      {
        label: "Archive",
        icon: Archive,
        variant: "default",
        onClick: () => handleArchive(vehicle.id),
      },
      {
        label: "Retire",
        icon: Ban,
        variant: "danger",
        onClick: () => handleRetire(vehicle.id),
      }
    );

    return actions;
  };

  // ─── Derived data ────────────────────────────────────────────────
  const pendingCount =
    statusOptions.find((o) => o.value === "pending_activation")?.count ?? 0;

  const mileageDueVehicles = useMemo(
    () => sortedVehicles.filter((v) => v.mileage_due),
    [sortedVehicles]
  );

  const baseVehicles =
    (statusFilter as any) === "mileage_due" ? mileageDueVehicles : sortedVehicles;

  const groupedSections: FleetSectionData[] = useMemo(() => {
    if (collectionFilter) {
      const col = collections.find((c) => c.id === collectionFilter);
      if (!col) return [];
      return [
        {
          collection: col,
          vehicles: col.vehicleIds
            .map((id) => baseVehicles.find((v) => v.id === id))
            .filter((v): v is Vehicle => Boolean(v)),
        },
      ];
    }

    const sections = collections.map((c) => ({
      collection: c,
      vehicles: c.vehicleIds
        .map((id) => baseVehicles.find((v) => v.id === id))
        .filter((v): v is Vehicle => Boolean(v)),
    }));

    const groupedIds = new Set(collections.flatMap((c) => c.vehicleIds));
    const ungrouped = baseVehicles.filter((v) => !groupedIds.has(v.id));

    return [
      ...sections.filter((s) => s.vehicles.length > 0),
      ...(ungrouped.length > 0 ? [{ collection: null, vehicles: ungrouped }] : []),
    ];
  }, [collections, baseVehicles, collectionFilter]);

  const displayVehicles = baseVehicles;
  const hasActiveFilter = statusFilter !== "" || collectionFilter !== null;

  // ─── Row handler factory ─────────────────────────────────────────
  const makeHandlers = (item: Vehicle) => ({
    onTouchStart: handleTouchStart(item),
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onClick: () => {
      if (longPressFired.current) {
        longPressFired.current = false;
        return;
      }
      if (isSelecting) {
        toggleSelection(item);
        return;
      }
      const trigger = document.querySelector(
        `[data-card-actions="${item.id}"] button`
      ) as HTMLButtonElement | null;
      trigger?.click();
    },
    // ✅ 3-dots button triggers the same action sheet
    onMoreClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isSelecting) {
        toggleSelection(item);
        return;
      }
      const trigger = document.querySelector(
        `[data-card-actions="${item.id}"] button`
      ) as HTMLButtonElement | null;
      trigger?.click();
    },
  });

  return (
    <div className="md:hidden animate-in fade-in duration-300 relative">
      <FleetToolbar
        isSelecting={isSelecting}
        selectedCount={selected.length}
        onClearSelection={clearSelection}
        onBatchAddToCollection={handleBatchAddToCollection}
        onBatchMileage={handleBatchMileage}
        onBatchMaintenance={handleBatchMaintenance}
        onBatchArchive={handleBatchArchive}
        search={search}
        setSearch={setSearch}
        onSearchFocus={() => setSearchFocused(true)}
        onSearchBlur={() => setTimeout(() => setSearchFocused(false), 150)}
        onClearSearch={handleClearSearch}
        searchInputRef={searchInputRef}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusOptions={statusOptions}
        collectionFilter={collectionFilter}
        setCollectionFilter={setCollectionFilter}
        collections={collections}
        onCreateCollection={openCreateCollection}
        hasActiveFilter={hasActiveFilter}
        searchFocused={searchFocused}
      />

      <FleetBanners
        loading={loading}
        pendingCount={pendingCount}
        mileageDueVehicles={mileageDueVehicles}
        filteredVehicles={filteredVehicles}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        hidden={searchFocused || isSelecting}
      />

      {loading ? (
        <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading vehicles...
        </div>
      ) : displayVehicles.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
            <Car size={24} className="text-[var(--color-ink-subtle)]" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
            No vehicles found
          </h3>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">
            {search || statusFilter
              ? "Try adjusting your search query or filters."
              : "Add your first vehicle to get started."}
          </p>
        </div>
      ) : (
        /* ✅ Full-bleed list container with rounded corners */
        <div className="pb-4">
          <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden">
            {groupedSections.map((section, sIdx) => {
              const isUngrouped = section.collection === null;
              const sectionId = isUngrouped
                ? "__ungrouped__"
                : section.collection!.id;
              const isCollapsed =
                !isUngrouped && collapsedSections[sectionId];

              return (
                <FleetSection
                  key={sectionId}
                  section={section}
                  isCollapsed={isCollapsed}
                  onToggleCollapse={() => toggleSection(sectionId)}
                  onEditCollection={
                    isUngrouped
                      ? undefined
                      : () => openEditCollection(section.collection!.id)
                  }
                  isMounted={mounted}
                  isDark={isDark}
                  isSelecting={isSelecting}
                  selectedIds={selectedIds}
                  activeRentals={activeRentals}
                  makeHandlers={makeHandlers}
                  isFirst={sIdx === 0}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden CardGrid to render action sheets */}
      <div className="hidden">
        <CardGrid
          data={displayVehicles}
          getCardId={(v: Vehicle) => v.id}
          compact={true}
          onCardClick={() => {}}
          cardClassName="!p-0"
          containerClassName="!p-0"
          renderCardHeader={() => <div className="hidden" />}
          renderCardBody={() => null}
          rowActions={getVehicleActions}
        />
      </div>

      {/* FAB stack */}
      {!isSelecting && !searchFocused && (
        <div
          data-fab-stack
          className="fixed right-4 bottom-[108px] z-[65] flex flex-col items-end gap-3"
        >
          {activeTab !== "fleet" && (
            <button
              type="button"
              onClick={() => handleTabChange("fleet")}
              aria-label="Back to Vehicles"
              className="w-12 h-12 rounded-xl bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-surface-border)] shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-center active:scale-95 hover:bg-[var(--color-surface-hover)]/90 transition-all"
            >
              <CarFront size={18} className="text-[var(--color-ink-muted)]" />
            </button>
          )}

          <button
            type="button"
            onClick={onAddVehicle}
            aria-label="Add Vehicle"
            className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/20 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-center active:scale-95 hover:bg-[var(--color-primary)]/30 transition-all"
          >
            <div className="relative flex items-center justify-center">
              <CarFront
                size={22}
                strokeWidth={2}
                className="text-[var(--color-primary)]"
              />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-sm">
                <Plus size={10} strokeWidth={3.5} />
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Collections modal */}
      <CollectionsModal
        open={collectionsModalOpen}
        onClose={() => {
          setCollectionsModalOpen(false);
          setEditingCollectionId(null);
        }}
        vehicles={sortedVehicles}
        initialVehicleIds={selected.map((v) => v.id)}
        editingCollectionId={editingCollectionId}
      />
    </div>
  );
}
