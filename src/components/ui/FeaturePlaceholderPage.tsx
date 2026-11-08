"use client";

import { Construction } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";

interface FeaturePlaceholderPageProps {
  title: string;
  description: string;
}

export default function FeaturePlaceholderPage({
  title,
  description,
}: FeaturePlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={description} icon={Construction} />
      <EmptyState
        icon={Construction}
        title="This page is under development"
        description={description}
      />
    </div>
  );
}
