// src/hooks/useDashboard.ts
import { useState, useEffect, useMemo } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import { tasksApi } from "@/lib/api/tasks";
import { invoicesApi } from "@/lib/api/invoices";
import { paymentsApi } from "@/lib/api/payments";
import type { Booking, Client, Vehicle, Task, Invoice, Payment } from "@/lib/types";

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsData, clientsData, vehiclesData, tasksData, invoicesData, paymentsData] =
          await Promise.all([
            bookingsApi.list(),
            clientsApi.list(),
            vehiclesApi.list(),
            tasksApi.getMyTasks({ page_size: 50 }),
            invoicesApi.list(),
            paymentsApi.list(),
          ]);

        setBookings(bookingsData || []);
        setClients(clientsData || []);
        setVehicles(vehiclesData || []);
        setTasks(tasksData || []);
        setInvoices(invoicesData || []);
        setPayments(paymentsData || []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const activeBookings = bookings.filter(
      (b) => b.status === "active" || b.status === "confirmed"
    ).length;
    const completedBookings = bookings.filter((b) => b.status === "completed").length;
    const fleetSize = vehicles.filter((v) => !v.is_archived).length;
    const totalClients = clients.filter((c) => !c.is_archived).length;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalRevenue = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const mtdRevenue = payments
      .filter((p) => {
        if (p.status !== "completed") return false;
        const d = new Date(p.paid_at || p.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const pendingPayments = invoices
      .filter((inv) => ["sent", "overdue", "partially_paid"].includes(inv.status))
      .reduce((sum, inv) => sum + Number(inv.remaining_balance || 0), 0);

    return {
      activeBookings,
      completedBookings,
      fleetSize,
      totalClients,
      mtdRevenue,
      totalRevenue,
      pendingPayments,
    };
  }, [bookings, vehicles, clients, invoices, payments]);

  const alerts = useMemo(() => {
    const vehiclesDueService = vehicles.filter((v) => {
      if (!v.next_service_km) return false;
      const kmLeft = v.next_service_km - v.current_mileage;
      return kmLeft < 1000 && kmLeft >= 0;
    }).length;

    const dlsExpiring = clients.filter((c) => {
      if (!c.dl_expiry) return false;
      const days = Math.ceil(
        (new Date(c.dl_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return days >= 0 && days < 30;
    }).length;

    const overdueReturns = bookings.filter(
      (b) => b.status === "active" && new Date(b.end_date) < new Date()
    ).length;

    return { vehiclesDueService, dlsExpiring, overdueReturns };
  }, [vehicles, clients, bookings]);

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((b) => b.status === "confirmed" || b.status === "active")
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 5);
  }, [bookings]);

  // ❌ REMOVED: Fake recentActivity (use useActivityTab instead)

  return {
    loading,
    stats,
    alerts,
    upcomingBookings,
    tasks,
    vehicles,
  };
}
