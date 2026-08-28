// src/lib/brand.ts
export const brand = {
  name: "Rental Garage",
  
  colors: {
    // ── PRIMARY: Deep Indigo-Navy (Wealth, Trust, Authority) ──────────
    // Rich like a bespoke suit, authoritative like a private bank
    primary:       "#3730A3", // Indigo 800 - Deep, confident
    primaryHover:  "#312E81", // Indigo 900 - Even deeper on hover
    primaryLight:  "#818CF8", // Indigo 400 - For subtle accents
    primaryMuted:  "rgba(55, 48, 163, 0.08)", // Ultra-subtle backgrounds
    primaryGlow:   "rgba(55, 48, 163, 0.15)", // For glow effects
    primaryGradient: "linear-gradient(135deg, #4338CA 0%, #312E81 100%)",
    
    // ── SECONDARY: Warm Gold (Premium, Luxury, Value) ─────────────────
    // Like fine jewelry - subtle but unmistakably premium
    secondary:     "#D97706", // Amber 600 - Warm, premium feel
    secondaryLight: "#FCD34D", // Amber 300
    secondaryMuted: "rgba(217, 119, 6, 0.10)",
    secondaryGradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",

    // ── SURFACE: Warm, Layered, Luxurious ──────────────────────────────
    // Light Mode: Warm whites with subtle warmth
    light: {
      bg:            "#F7F4F0", // Warm cream - like expensive paper
      bgElevated:    "#F0EDE8", // Slightly deeper cream
      surface:       "#FFFFFF", // Pure white - but with warm context
      surfaceWarm:   "#FDFCFA", // Warm white for cards
      surfaceHover:  "#FAF8F5", // Subtle warm hover
      surfaceActive: "#F5F2ED", // Active state
      surfaceBorder: "rgba(44, 38, 32, 0.08)", // Warm-tinted border
      surfaceBorderStrong: "rgba(44, 38, 32, 0.14)",
      surfaceBorderLight: "rgba(44, 38, 32, 0.04)",
    },
    
    // Dark Mode: Deep charcoal with warmth
    dark: {
      bg:            "#0C0A09", // Warm near-black
      bgElevated:    "#14110E", // Deep warm charcoal
      surface:       "#1A1714", // Warm dark surface
      surfaceWarm:   "#1F1C18", // Slightly warmer
      surfaceHover:  "#25211D", // Hover state
      surfaceActive: "#2C2823", // Active state
      surfaceBorder: "rgba(255, 248, 240, 0.06)",
      surfaceBorderStrong: "rgba(255, 248, 240, 0.12)",
      surfaceBorderLight: "rgba(255, 248, 240, 0.03)",
    },

    // ── INK: Exceptional Readability ────────────────────────────────────
    ink: {
      primary:      "#1C1917", // Warm near-black - easiest on eyes
      secondary:    "#292524", // Deep warm
      muted:        "#57534E", // Warm gray - readable
      subtle:       "#78716C", // Lighter warm gray
      faint:        "#A8A39E", // Very light
      inverse:      "#FAF8F5", // For dark mode
    },

    // ── SEMANTIC: Refined, Not Screaming ──────────────────────────────
    success: {
      main:        "#065F46", // Deep emerald - refined
      light:       "#10B981",
      bg:          "rgba(6, 95, 70, 0.08)",
      text:        "#065F46",
      border:      "rgba(6, 95, 70, 0.15)",
    },
    
    warning: {
      main:        "#92400E", // Deep amber
      light:       "#F59E0B",
      bg:          "rgba(146, 64, 14, 0.08)",
      text:        "#92400E",
      border:      "rgba(146, 64, 14, 0.15)",
    },
    
    danger: {
      main:        "#991B1B", // Deep red - not alarming
      light:       "#EF4444",
      bg:          "rgba(153, 27, 27, 0.08)",
      text:        "#991B1B",
      border:      "rgba(153, 27, 27, 0.15)",
    },
    
    info: {
      main:        "#1E40AF", // Deep blue
      light:       "#3B82F6",
      bg:          "rgba(30, 64, 175, 0.08)",
      text:        "#1E40AF",
      border:      "rgba(30, 64, 175, 0.15)",
    },

    // ── GRADIENTS: Rich, Dimensional, Premium ──────────────────────────
    gradients: {
      // Primary brand gradient - the "hero" gradient
      brand:       "linear-gradient(145deg, #4338CA 0%, #312E81 45%, #1E1B4B 100%)",
      brandLight:  "linear-gradient(145deg, #818CF8 0%, #4338CA 100%)",
      
      // Secondary - warm gold
      gold:        "linear-gradient(145deg, #FCD34D 0%, #D97706 50%, #92400E 100%)",
      goldLight:   "linear-gradient(145deg, #FDE68A 0%, #F59E0B 100%)",
      
      // Surface gradients
      surfaceLight: "linear-gradient(145deg, #FFFFFF 0%, #FAF8F5 100%)",
      surfaceDark:  "linear-gradient(145deg, #1A1714 0%, #14110E 100%)",
      
      // Backgrounds
      bgLight:     "linear-gradient(160deg, #F7F4F0 0%, #F0EDE8 50%, #E8E4DE 100%)",
      bgDark:      "linear-gradient(160deg, #0C0A09 0%, #14110E 50%, #1A1714 100%)",
      
      // Stat cards
      statPrimary: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
      statSuccess: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
      statWarning: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
      statDanger:  "linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)",
      
      // Dark stat cards
      statPrimaryDark: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.08) 100%)",
      statSuccessDark: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)",
      statWarningDark: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)",
      statDangerDark:  "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%)",
    },

    // ── SHADOWS: Deep, Warm, Dimensional ──────────────────────────────
    // Multi-layered shadows create premium depth
    shadows: {
      xs:     "0 1px 2px 0 rgba(44, 38, 32, 0.04)",
      sm:     "0 1px 3px 0 rgba(44, 38, 32, 0.06), 0 1px 2px -1px rgba(44, 38, 32, 0.04)",
      md:     "0 4px 12px -2px rgba(44, 38, 32, 0.08), 0 2px 4px -2px rgba(44, 38, 32, 0.04)",
      lg:     "0 12px 24px -4px rgba(44, 38, 32, 0.10), 0 4px 6px -4px rgba(44, 38, 32, 0.05)",
      xl:     "0 20px 32px -6px rgba(44, 38, 32, 0.12), 0 8px 12px -6px rgba(44, 38, 32, 0.06)",
      "2xl":   "0 25px 50px -12px rgba(44, 38, 32, 0.20)",
      
      // Cards with warm shadows
      card:      "0 1px 3px 0 rgba(44, 38, 32, 0.06), 0 1px 2px -1px rgba(44, 38, 32, 0.04)",
      cardHover: "0 8px 25px -8px rgba(55, 48, 163, 0.12), 0 1px 3px 0 rgba(44, 38, 32, 0.08)",
      
      // Premium glow
      glow:      "0 0 40px rgba(55, 48, 163, 0.08)",
      glowGold:  "0 0 40px rgba(217, 119, 6, 0.08)",
      
      // Focus state
      focus:     "0 0 0 2px #FFFFFF, 0 0 0 4px #4338CA",
      focusRing: "0 0 0 3px rgba(67, 56, 202, 0.25)",
    },

    // ── DARK MODE SHADOWS ──────────────────────────────────────────────
    darkShadows: {
      card:      "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)",
      cardHover: "0 8px 25px -8px rgba(0, 0, 0, 0.6), 0 1px 3px 0 rgba(0, 0, 0, 0.3)",
      glow:      "0 0 40px rgba(99, 102, 241, 0.06)",
      focus:     "0 0 0 2px #1A1714, 0 0 0 4px #6366F1",
      focusRing: "0 0 0 3px rgba(99, 102, 241, 0.30)",
    },
  },

  typography: {
    font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight",
    h1: "font-display text-3xl sm:text-4xl font-bold tracking-tight",
    h2: "font-display text-2xl sm:text-3xl font-semibold tracking-tight",
    h3: "font-display text-xl sm:text-2xl font-semibold",
    h4: "font-display text-lg font-semibold",
    h5: "font-display text-base font-semibold",
    body: "text-base leading-relaxed",
    bodySmall: "text-sm leading-relaxed",
    label: "text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]",
    mono: "font-mono text-sm",
  },

  spacing: {
    sidebar: "260px",
    sidebarCollapsed: "72px",
    card: "p-4 sm:p-6",
    gap: "gap-4 sm:gap-6",
    pageX: "px-4 sm:px-6",
    pageY: "py-4 sm:py-6",
  },

  radius: {
    xs: "rounded",        // 4px - Small elements
    sm: "rounded-lg",     // 8px - Buttons, inputs
    md: "rounded-xl",     // 12px - Cards, dropdowns
    lg: "rounded-2xl",    // 16px - Modals, large cards
    xl: "rounded-3xl",    // 24px - Special containers
    full: "rounded-full", // Badges, avatars
  },

  easing: {
    spring: "cubic-bezier(0.16, 1, 0.3, 1)",
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
} as const;
