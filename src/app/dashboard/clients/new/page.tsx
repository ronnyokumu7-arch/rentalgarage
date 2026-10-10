// src/app/dashboard/clients/new/page.tsx
import { redirect } from "next/navigation";

/**
 * ✅ CONSOLIDATION: 
 * Client creation is now handled entirely by the AddClientModal 
 * on the main /dashboard/clients page. This route redirects 
 * to prevent duplicate UI maintenance.
 */
export default function NewClientPage() {
  redirect("/dashboard/clients");
}
