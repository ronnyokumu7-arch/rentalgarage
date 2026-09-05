import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api/users";
import type { User } from "@/lib/types";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";

export type CategoryMode = "executive" | "staff";

const isExecutive = (user: User) => {
  if (user.role === "super_admin" || user.role === "tenant_admin") return true;
  const execTitles = [
    "CEO",
    "Director",
    "General Manager",
    "Founder",
    "Founder & CEO",
    "Managing Director",
  ];
  return execTitles.includes(user.job_title || "");
};

const getSortPriority = (role: string, jobTitle?: string | null) => {
  if (role === "super_admin" || role === "tenant_admin") return 1;
  if (jobTitle === "Admin" || jobTitle === "Director") return 2;
  if (["CEO", "General Manager", "Founder", "Founder & CEO"].includes(jobTitle || "")) return 3;
  if (jobTitle === "Manager") return 4;
  if (["Accountant", "Cashier", "Credit Control"].includes(jobTitle || "")) return 5;
  if (jobTitle === "HR") return 6;
  if (["Dispatcher", "Head of Operations", "Operations Manager"].includes(jobTitle || "")) return 7;
  return 8;
};

export function useUsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<CategoryMode>("executive");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.list();
      // ✅ FIXED: Added safe fallback to guarantee 'users' state is always an array
      setUsers(data || []);
    } catch (err: any) {
      console.error("Failed to load team members:", err);
      setError(err.response?.data?.detail || "Failed to load team members");
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ LIVE REFRESH: focus + visibility listeners for cross-tab changes
  useLiveRefresh(fetchUsers);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✅ AUTO-REFRESH: listen for user creation + updates from modals / inline contexts
  useEffect(() => {
    const handleUserEvent = () => fetchUsers();
    window.addEventListener('user:created', handleUserEvent);
    window.addEventListener('user:updated', handleUserEvent);
    
    return () => {
      window.removeEventListener('user:created', handleUserEvent);
      window.removeEventListener('user:updated', handleUserEvent);
    };
  }, [fetchUsers]);

  // Counters for Toolbar UI
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active && !u.is_suspended).length;
  const inactiveUsers = users.filter((u) => !u.is_active || u.is_suspended).length;

  // Memoized filter and sort pipeline
  const filteredUsers = useMemo(() => {
    let result = users;

    // 1. Category Filter (Executive vs Staff)
    if (category === "executive") {
      result = result.filter((u) => isExecutive(u));
    } else {
      result = result.filter((u) => !isExecutive(u));
    }

    // 2. Department Filter
    if (departmentFilter) {
      const targetDept = departmentFilter.toLowerCase().trim();
      result = result.filter((u) => u.department?.toLowerCase().trim() === targetDept);
    }

    // 3. Search Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone_number && u.phone_number.toLowerCase().includes(q)) ||
          (u.job_title && u.job_title.toLowerCase().includes(q)) ||
          (u.department && u.department.toLowerCase().includes(q))
      );
    }

    // 4. Sort Priority
    return [...result].sort((a, b) => {
      const priorityA = getSortPriority(a.role, a.job_title);
      const priorityB = getSortPriority(b.role, b.job_title);
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.full_name.localeCompare(b.full_name);
    });
  }, [users, category, departmentFilter, search]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, departmentFilter, search]);

  // Updates user in state or prepends if newly generated (e.g. quick invite token creation)
  const updateUserLocally = useCallback((updatedUser: User) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === updatedUser.id);
      if (exists) {
        return prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      }
      return [updatedUser, ...prev];
    });
  }, []);

  const removeUserLocally = useCallback((userId: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const handleSendVerification = useCallback(async (userId: number, channel: "email" | "phone") => {
    try {
      await usersApi.sendVerification(userId, { channel });
      toast.success(`Verification ${channel} sent successfully!`);
      
      // ✅ AUTO-REFRESH: notify users list to refetch
      window.dispatchEvent(new CustomEvent('user:updated', { detail: { userId } }));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to send verification ${channel}`);
    }
  }, []);

  const handleMarkVerified = useCallback(async (userId: number, channel: "email" | "phone") => {
    try {
      const updatedUser = await usersApi.markVerified(userId, { channel });
      updateUserLocally(updatedUser);
      toast.success(`User ${channel} marked as verified!`);
      
      // ✅ AUTO-REFRESH: notify users list to refetch
      window.dispatchEvent(new CustomEvent('user:updated', { detail: { userId } }));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to mark ${channel} as verified`);
    }
  }, [updateUserLocally]);

  return {
    users,
    filteredUsers,
    paginatedUsers,
    loading,
    error,
    totalUsers,
    activeUsers,
    inactiveUsers,
    category,
    setCategory,
    search,
    setSearch,
    departmentFilter,
    setDepartmentFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    refetch: fetchUsers,
    updateUserLocally,
    removeUserLocally,
    handleSendVerification,
    handleMarkVerified,
  };
}
