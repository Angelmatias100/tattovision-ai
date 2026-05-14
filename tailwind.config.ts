import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ── Color system — all map to CSS vars defined in globals.css ── */
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        /* Explicit brand tokens — use when you need a literal value */
        tv: {
          black:       "#000000",
          surface:     "#0D0010",
          elevated:    "#1A0025",
          interactive: "#200030",
          border:      "#2D0050",
          purple:      "#8B00FF",
          lavender:    "#C084FC",
          white:       "#FFFFFF",
          success:     "#52C97A",
          warning:     "#E0B800",
          error:       "#FF3B3B",
        },
      },

      /* ── Typography ───────────────────────────────────────────── */
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        sans:     ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono:     ["var(--font-jetbrains)", "Menlo", "monospace"],
      },

      /* ── Border radius ───────────────────────────────────────── */
      borderRadius: {
        xl:      "var(--radius-xl)",
        lg:      "var(--radius-lg)",
        md:      "var(--radius-md)",
        DEFAULT: "var(--radius)",
        sm:      "var(--radius-sm)",
      },

      /* ── Box shadows — glow effects per design spec ──────────── */
      boxShadow: {
        glow:    "0 0 30px rgba(139,0,255,0.25)",
        "glow-sm": "0 0 15px rgba(139,0,255,0.15)",
        "glow-lg": "0 0 40px rgba(139,0,255,0.50)",
        "glow-xl": "0 0 60px rgba(139,0,255,0.40)",
        card:    "0 4px 24px rgba(0,0,0,0.60)",
      },

      /* ── Animations ──────────────────────────────────────────── */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(139,0,255,0.20)" },
          "50%":       { boxShadow: "0 0 40px rgba(139,0,255,0.50)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to:   { transform: "translateX(0)",     opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-up":        "fade-up 0.3s ease-out",
        "fade-in":        "fade-in 0.2s ease-out",
        "glow-pulse":     "glow-pulse 2s ease-in-out infinite",
        "slide-in-left":  "slide-in-left 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
