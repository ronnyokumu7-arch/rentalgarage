// src/components/ui/SecureImage.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import apiClient from "@/lib/api-client";

/**
 * ✅ SECURE IMAGE RESOLUTION
 *
 * Stored URLs look like: {api}/api/v1/files/tenant_{id}/{category}/{uuid}.{ext}
 * Browsers/<img> tags can't send the JWT header, so we exchange them for
 * short-lived signed Cloudinary URLs via the authenticated /signed endpoint.
 *
 * - Module-level cache (8 min) avoids re-fetching on every render
 * - Cache key strips query strings so retry params don't pollute it
 * - Non-API URLs (public assets) pass through untouched
 * - Failures render the provided fallback (never a broken image icon)
 */

const MARKER = "/api/v1/files/";
const CACHE_TTL_MS = 8 * 60 * 1000; // refresh 2 min before the 10-min expiry

const signedCache = new Map<string, { url: string; expiresAt: number }>();

export async function fetchSignedUrl(
  storedUrl: string | null | undefined,
  bustCache = false,
): Promise<string | null> {
  if (!storedUrl) return null;

  const idx = storedUrl.indexOf(MARKER);
  if (idx === -1) return storedUrl; // not a secure API URL → render as-is

  // ✅ Strip query string before extracting relative path — keeps cache key
  // stable and prevents carrier proxies from serving stale signed URLs.
  const dirtyPath = storedUrl.slice(idx + MARKER.length);
  const relativePath = dirtyPath.split("?")[0];

  const cached = signedCache.get(relativePath);
  if (!bustCache && cached && cached.expiresAt > Date.now()) return cached.url;

  try {
    // ✅ BUST CACHE: bump a query param on the /signed call itself.
    // Carrier proxies cache the response (the signed URL) aggressively;
    // this param changes the URL, forcing them to re-fetch.
    const bust = bustCache ? `?_=${Date.now()}` : "";
    const res = await apiClient.get<{ url: string; ttl_seconds: number }>(
      `/files/${relativePath}/signed${bust}`,
    );
    signedCache.set(relativePath, {
      url: res.data.url,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return res.data.url;
  } catch (err) {
    // ✅ Surface mobile network errors to console for debugging
    console.warn(`[SecureImage] failed to resolve ${relativePath}:`, err);
    return null;
  }
}

interface SecureImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: ReactNode;
}

export default function SecureImage({
  src,
  alt,
  className,
  fallback = null,
}: SecureImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSignedUrl(null);
    setFailed(false);
    if (!src) return;

    fetchSignedUrl(src).then((url) => {
      if (!cancelled) {
        if (url) setSignedUrl(url);
        else setFailed(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!src || failed || !signedUrl) return <>{fallback}</>;

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}
