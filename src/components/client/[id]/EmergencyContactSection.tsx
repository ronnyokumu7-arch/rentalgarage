// src/components/client/[id]/EmergencyContactSection.tsx
"use client";

import { Phone, User as UserIcon } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import { ProfileField } from "@/components/profile/ProfileLayout";
import type { Client } from "@/lib/types";

interface EmergencyContactSectionProps {
  client: Client;
}

export default function EmergencyContactSection({
  client,
}: EmergencyContactSectionProps) {
  return (
    <SectionCard title="Emergency Contact" icon={Phone}>
      <div className="flex flex-col">
        <ProfileField
          label="Name"
          value={client.next_of_kin_name}
          icon={UserIcon}
        />
        <ProfileField
          label="Phone"
          value={client.next_of_kin_phone}
          icon={Phone}
          isMono
        />
        <div className="pt-4 flex justify-end">
          <span className="text-xs text-[var(--color-ink-subtle)] italic">
            Not editable yet
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
