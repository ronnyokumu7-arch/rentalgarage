import type { AxiosError } from "axios";

export type ApiAction = {
  label: string;
  href?: string;
  action: "retry" | "navigate" | "dismiss" | "reload";
};

export type ApiErrorBody = {
  type?: "error" | "success" | "warning" | "info";
  title?: string;
  message?: string;
  action?: ApiAction;
  field_errors?: Record<string, string>;
  details?: Record<string, unknown>;
  /** Compatibility only for endpoints not yet on the StandardResponse contract. */
  detail?: unknown;
};

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return Boolean(value && typeof value === "object");
}

/**
 * Reads only the server-authored message from an API response.
 * Network failures have no server response, so callers may provide their own
 * availability fallback rather than presenting them as business errors.
 */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const data = (error as AxiosError<ApiErrorBody>)?.response?.data;
  return getApiErrorMessageFromBody(data, fallback);
}

/** Reads the same backend contract for `fetch` callers. */
export function getApiErrorMessageFromBody(data: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!isApiErrorBody(data)) return fallback;

  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
  if (Array.isArray(data.detail) && data.detail[0] && typeof data.detail[0] === "object") {
    const first = data.detail[0] as { msg?: unknown };
    if (typeof first.msg === "string" && first.msg.trim()) {
      return first.msg.replace(/^Value error,?\s*/i, "");
    }
  }
  return fallback;
}

export function getApiFieldErrors(error: unknown): Record<string, string> | undefined {
  const data = (error as AxiosError<ApiErrorBody>)?.response?.data;
  return isApiErrorBody(data) ? data.field_errors : undefined;
}

/**
 * Lets legacy consumers read `response.data.detail` while receiving the
 * StandardResponse's backend-authored message. This is transitional support;
 * new UI must use `message` and `field_errors` directly.
 */
export function normalizeApiErrorBody(data: unknown): unknown {
  if (!isApiErrorBody(data) || typeof data.message !== "string" || data.detail !== undefined) return data;
  return { ...data, detail: data.message };
}
