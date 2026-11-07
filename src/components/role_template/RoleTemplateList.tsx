"use client";

import { useRoleTemplates } from "@/hooks/role_template/useRoleTemplates";
import { DotsThree as MoreHorizontal } from "@phosphor-icons/react/ssr";

export default function RoleTemplateList() {
  const { roles } = useRoleTemplates();

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-[var(--color-surface-border)] flex justify-between items-center">
        <h3 className="font-bold text-[var(--color-ink)]">Role Templates</h3>
        <button className="bg-[var(--color-primary)] text-white text-xs px-3 py-1.5 rounded-lg font-bold">
          Create Template
        </button>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="bg-[var(--color-surface-hover)]/20 text-[var(--color-ink-muted)] uppercase">
          <tr>
            <th className="p-4">Name</th>
            <th className="p-4">Description</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id} className="border-t border-[var(--color-surface-border)]">
              <td className="p-4 font-bold text-[var(--color-ink)]">{role.name}</td>
              <td className="p-4 text-[var(--color-ink-muted)]">{role.description}</td>
              <td className="p-4 text-right">
                <button className="text-[var(--color-ink-subtle)] hover:text-[var(--color-primary)]">
                  <MoreHorizontal size={16} aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
