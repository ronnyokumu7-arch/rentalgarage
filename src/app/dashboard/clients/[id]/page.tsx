// src/app/dashboard/clients/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import ProfileLayout from "@/components/profile/ProfileLayout";
import SecureLightbox from "@/components/ui/SecureLightbox";
import ReviewVerificationModal from "@/components/client/ReviewVerificationModal";

import ClientProfileHeader from "@/components/client/[id]/ClientProfileHeader";
import ClientStatusBanner from "@/components/client/[id]/ClientStatusBanner";
import IdentitySection from "@/components/client/[id]/IdentitySection";
import DrivingSection from "@/components/client/[id]/DrivingSection";
import ClientDriverSection from "@/components/client/[id]/ClientDriverSection";
import EmergencyContactSection from "@/components/client/[id]/EmergencyContactSection";
import ComplianceDocumentsSection from "@/components/client/[id]/ComplianceDocumentsSection";
import IdentityEditModal from "@/components/client/[id]/IdentityEditModal";
import DrivingEditModal from "@/components/client/[id]/DrivingEditModal";
import { useClientProfile } from "@/hooks/clients/useClientProfile";

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = parseInt(params.id as string);

  const profile = useClientProfile(clientId);
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(
    null,
  );
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  if (profile.isFetching || !profile.clientData) {
    return (
      <ProfileLayout
        title="Client Profile"
        subtitle="Loading..."
        initials="..."
        status="pending"
        statusLabel="Loading"
        backHref="/dashboard/clients"
        backLabel="Clients"
        loading
      >
        <div />
      </ProfileLayout>
    );
  }

  const c = profile.clientData;
  const displayName =
    [c.first_name, c.last_name].filter(Boolean).join(" ") || "Client";
  const initials =
    `${c.first_name?.[0] ?? ""}${c.last_name?.[0] ?? ""}`.toUpperCase() || "C";

  const openLightbox = (src: string | null | undefined, label: string) => {
    if (src) setLightbox({ src, label });
  };

  return (
    <>
      <ProfileLayout
        title={displayName}
        subtitle={`Client Profile · Joined ${new Date(c.created_at).toLocaleDateString(
          "en-GB",
          { month: "short", year: "numeric" },
        )}`}
        initials={initials}
        status={profile.clientStatus as any}
        statusLabel={profile.statusLabel}
        backHref="/dashboard/clients"
        backLabel="Clients"
        actionNode={
          <ClientProfileHeader
            client={c}
            actionLoading={profile.actionLoading}
            onEditIdentity={() => profile.setEditModal("identity")}
            onEditDriving={() => profile.setEditModal("driving")}
            onReviewVerification={() => setReviewModalOpen(true)}
            onSuspend={() => profile.handleStatusAction("suspend")}
            onReactivate={() => profile.handleStatusAction("reactivate")}
            onArchive={() => profile.handleArchive()}
          />
        }
      >
        <ClientStatusBanner
          client={c}
          onManageVerification={() => setReviewModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <IdentitySection
              client={c}
              onEdit={() => profile.setEditModal("identity")}
            />
            <DrivingSection
              client={c}
              onEdit={() => profile.setEditModal("driving")}
            />
            <ClientDriverSection
              client={c}
              onEdit={() => profile.setEditModal("driving")}
              onPreviewDoc={openLightbox}
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <EmergencyContactSection client={c} />
            <ComplianceDocumentsSection
              client={c}
              files={{
                idFrontFile: profile.idFrontFile,
                setIdFrontFile: profile.setIdFrontFile,
                idBackFile: profile.idBackFile,
                setIdBackFile: profile.setIdBackFile,
                dlFrontFile: profile.dlFrontFile,
                setDlFrontFile: profile.setDlFrontFile,
              }}
              loading={profile.loading}
              onSave={profile.handleUploadDocuments}
              onDiscard={profile.clearDocFiles}
              onPreview={openLightbox}
              onManageVerification={() => setReviewModalOpen(true)}
            />
          </div>
        </div>
      </ProfileLayout>

      <IdentityEditModal
        open={profile.editModal === "identity"}
        client={c}
        formData={profile.formData}
        updateField={profile.updateField}
        avatarFile={profile.avatarFile}
        setAvatarFile={profile.setAvatarFile}
        avatarPreview={profile.avatarPreview}
        setAvatarPreview={profile.setAvatarPreview}
        loading={profile.loading}
        onClose={profile.closeModal}
        onSave={profile.handleSaveModal}
      />

      <DrivingEditModal
        open={profile.editModal === "driving"}
        client={c}
        formData={profile.formData}
        updateField={profile.updateField}
        driverIdFrontFile={profile.driverIdFrontFile}
        setDriverIdFrontFile={profile.setDriverIdFrontFile}
        driverDlFrontFile={profile.driverDlFrontFile}
        setDriverDlFrontFile={profile.setDriverDlFrontFile}
        loading={profile.loading}
        onClose={profile.closeModal}
        onSave={profile.handleSaveModal}
      />

      <ReviewVerificationModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        personId={clientId}
        personType="client"
        onSuccess={profile.loadClient}
      />

      <SecureLightbox
        url={lightbox?.src ?? null}
        title={lightbox?.label}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}
