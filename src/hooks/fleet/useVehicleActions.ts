import { useRouter } from "next/navigation";
import {
  Car, Archive, Shield, Ban, Wrench, Banknote, Pencil,
} from "lucide-react";
import type { RowAction } from "@/components/ui/CardGrid";
import type { Vehicle } from "@/lib/types";

interface UseVehicleActionsParams {
  setGarageVehicle: (v: Vehicle | null) => void;
  setGarageModalOpen: (open: boolean) => void;
  setPricingVehicle: (v: Vehicle | null) => void;
  setIsPricingModalOpen: (open: boolean) => void;
  setEditVehicle: (v: Vehicle | null) => void;
  setIsEditModalOpen: (open: boolean) => void;
  handleStatusAction: (id: number, action: string) => void;
  handleArchive: (id: number) => void;
  handleRetire: (id: number) => void;
}

export function useVehicleActions({
  setGarageVehicle,
  setGarageModalOpen,
  setPricingVehicle,
  setIsPricingModalOpen,
  setEditVehicle,
  setIsEditModalOpen,
  handleStatusAction,
  handleArchive,
  handleRetire,
}: UseVehicleActionsParams) {
  const router = useRouter();

  return (vehicle: Vehicle): RowAction<Vehicle>[] => {
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

    // ✅ Edit Details — always available for non-archived vehicles
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
}
