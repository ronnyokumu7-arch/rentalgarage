import { BarChart3 } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Review performance and activity across your rental business."
      />
      <EmptyState
        icon={BarChart3}
        title="Reports are being prepared"
        description="Business reports will appear here when they are available."
      />
    </div>
  );
}
