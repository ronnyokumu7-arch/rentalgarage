// src/lib/app-toast.tsx
import toast from "react-hot-toast";
import { AppToast, AppToastResponse, ToastAction } from "@/components/ui/AppToast";

// ✅ Re-export types so api-client.ts can use them without circular dependencies
export type { AppToastResponse, ToastAction } from "@/components/ui/AppToast";

interface ShowToastOptions {
  /**
   * Called when the user clicks a "retry" action. Should re-fire the original request.
   * For navigate / reload / dismiss, the toast handles it internally.
   */
  onRetry?: () => void | Promise<void>;
  /** Override default duration (ms). Defaults: 4000 success, 6000 others. */
  duration?: number;
}

interface ShowToastResult {
  /** Field-level errors for form highlighting. Undefined if none. */
  field_errors?: Record<string, string>;
  /** The toast ID (for programmatic dismissal). */
  toastId: string;
}

/**
 * Renders a backend-authored StandardResponse as a branded toast.
 *
 * ✅ USAGE:
 *   const { field_errors } = showAppToast(apiResponse);
 *   if (field_errors) form.setErrorFields(field_errors);
 *
 * ✅ ACTIONS:
 *   - retry   → calls your onRetry callback, then dismisses
 *   - navigate → window.location.href = action.href
 *   - reload   → window.location.reload()
 *   - dismiss  → just dismisses
 *
 * Returns field_errors for forms to highlight invalid fields.
 */
export function showAppToast(
  response: AppToastResponse,
  options: ShowToastOptions = {},
): ShowToastResult {
  const duration = options.duration ?? (response.type === "success" ? 4000 : 6000);

  const onAction = async (action: ToastAction) => {
    if (action.action === "retry" && options.onRetry) {
      await options.onRetry();
    }
  };

  const toastId = toast.custom(
    (t) => <AppToast t={t} response={response} onAction={onAction} />,
    { duration },
  );

  return {
    field_errors: response.field_errors,
    toastId,
  };
}

/**
 * Quick helpers for one-off frontend-initiated toasts (loading states, etc.)
 * Backend-authored toasts should ALWAYS go through showAppToast().
 */
export const appToast = {
  loading: (message: string) =>
    toast.loading(message, { duration: Infinity }),
  dismiss: (toastId?: string) => toast.dismiss(toastId),
};
