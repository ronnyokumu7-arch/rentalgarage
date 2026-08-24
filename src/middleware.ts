// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── ROUTE CLASSIFICATION ─────────────────────────────────────────────────
// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/verify",              // Email verification
  "/invite/",             // Tenant onboarding invites (matches /invite/[token])
  "/contracts/view/",     // Public contract viewing (matches /contracts/view/[token])
  "/invoice/",            // Public invoice viewing (matches /invoice/[token])
  "/commission/pay",      // Commission payment page
];

// Protected routes that require authentication
const AUTH_ROUTES = ["/dashboard", "/super-admin"];

// ─── ATTACK PATTERNS ──────────────────────────────────────────────────────
// Block common scanner probes at the edge — never reach serverless functions
const ATTACK_PATTERNS: RegExp[] = [
  /wp-.*\.php$/i,           // WordPress probes
  /xmlrpc\.php$/i,          // WordPress XML-RPC
  /adminer\.php$/i,         // DB admin tools
  /phpmyadmin/i,            // phpMyAdmin probes
  /\.php$/i,                // Any PHP file (this is a Next.js app)
  /shell\.php$/i,           // Common shells
  /c99\.php$/i,             // C99 shell
  /r57\.php$/i,             // R57 shell
  /\.env$/i,                // Env file probes
  /\.git/i,                 // Git directory probes
  /\.svn/i,                 // SVN probes
  /composer\.json$/i,       // Composer config
  /\.bak$/i,                // Backup probes
  /\.old$/i,                // Old file probes
  /\.sql$/i,                // SQL dump probes
  /\.DS_Store$/i,           // macOS metadata
  /Thumbs\.db$/i,           // Windows thumbnail cache
  /this_is_a_new_hello_world/i, // Known scanner signature
  /222\.php$/i,             // Known scanner signature
];

// ─── BAD BOT PATTERNS ─────────────────────────────────────────────────────
const BAD_BOTS: RegExp[] = [
  /python-requests/i,
  /curl\/\d/i,
  /wget/i,
  /scrapy/i,
  /nikto/i,
  /sqlmap/i,
  /masscan/i,
  /nmap/i,
  /havij/i,
  /libwww-perl/i,
];

// ─── JWT VALIDATION ───────────────────────────────────────────────────────
/**
 * Lightweight JWT validation (no dependencies).
 * Validates structure, expiry, and token type.
 */
function validateJWT(token: string): { 
  valid: boolean; 
  expired: boolean;
  type?: string;
} {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, expired: false };
    
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    
    const now = Math.floor(Date.now() / 1000);
    const expired = payload.exp && payload.exp < now;
    
    return { 
      valid: true, 
      expired,
      type: payload.type  // "access" or "refresh"
    };
  } catch {
    return { valid: false, expired: false };
  }
}

// ─── STATIC FILE DETECTION ────────────────────────────────────────────────
function isStaticAsset(pathname: string): boolean {
  // Match common static file extensions
  return /\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot|map)$/.test(pathname);
}

// ─── COOKIE NAME CONFIG ───────────────────────────────────────────────────
// Must match what auth-context.tsx uses for the access token cookie
const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE || "rm_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent") || "";

  // ── LAYER 1: Attack Pattern Block ──────────────────────────────────────
  for (const pattern of ATTACK_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // ── LAYER 2: Bot Protection ────────────────────────────────────────────
  for (const botPattern of BAD_BOTS) {
    if (botPattern.test(userAgent)) {
      return new NextResponse(null, { status: 403 });
    }
  }

  // ── LAYER 3: Static Files Bypass ───────────────────────────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    isStaticAsset(pathname)
  ) {
    return NextResponse.next();
  }

  // ── LAYER 4: JWT Validation ────────────────────────────────────────────
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const tokenValidation = token ? validateJWT(token) : { valid: false, expired: false };
  
  // ✅ Validate token type (prevent refresh tokens from being used as access tokens)
  const isValidAccessToken = tokenValidation.valid && 
                             !tokenValidation.expired && 
                             tokenValidation.type === "access";

  // Clear expired or invalid tokens
  if (token && (tokenValidation.expired || (tokenValidation.valid && tokenValidation.type !== "access"))) {
    const response = NextResponse.next();
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  // ── LAYER 5: Route Protection ──────────────────────────────────────────
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect authenticated users away from login page
  if (isPublicRoute && isValidAccessToken && pathname === "/login") {
    const redirectUrl = new URL("/dashboard", request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }

  // Protect authenticated routes
  if (isAuthRoute && !isValidAccessToken) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }

  // ── LAYER 6: Pass Through ──────────────────────────────────────────────
  // Note: Rate limiting is handled by FastAPI backend via Redis
  // Note: CORS is handled by FastAPI backend
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
