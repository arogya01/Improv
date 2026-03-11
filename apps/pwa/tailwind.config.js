/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "var(--bg-primary)",
        foreground: "var(--ink-800)",
        primary: {
          DEFAULT: "var(--teal-500)",
          foreground: "var(--ink-100)",
        },
        secondary: {
          DEFAULT: "var(--indigo-500)",
          foreground: "var(--ink-100)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        ink: {
          50: "var(--ink-50)",
          100: "var(--ink-100)",
          400: "var(--ink-400)",
          600: "var(--ink-600)",
          700: "var(--ink-700)",
          800: "var(--ink-800)",
          900: "var(--ink-900)",
        },
        teal: {
          50: "var(--teal-50)",
          200: "var(--teal-200)",
          300: "var(--teal-300)",
          500: "var(--teal-500)",
          600: "var(--teal-600)",
          700: "var(--teal-700)",
          900: "var(--teal-900)",
        },
        indigo: {
          50: "var(--indigo-50)",
          200: "var(--indigo-200)",
          500: "var(--indigo-500)",
          900: "var(--indigo-900)",
        },
        editorial: {
          cream: "var(--editorial-cream)",
          "warm-white": "var(--editorial-warm-white)",
          charcoal: "var(--editorial-charcoal)",
          "warm-accent": "var(--editorial-warm-accent)",
          muted: "var(--editorial-muted)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        ui: ["var(--font-ui)", '"DM Sans"', "sans-serif"],
        headline: ["var(--font-headline)", '"Fraunces"', "serif"],
        body: ["var(--font-body)", '"DM Sans"', "sans-serif"],
        mono: ["var(--font-mono)", '"IBM Plex Mono"', "monospace"],
      },
      boxShadow: {
        ethereal: "var(--shadow-sm)",
        "ethereal-md": "var(--shadow-md)",
        "ethereal-lg": "var(--shadow-lg)",
        "ethereal-xl": "var(--shadow-xl)",
      },
      backdropBlur: {
        glass: "32px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "orb-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.4" },
          "50%": { transform: "scale(1.08)", opacity: "0.7" },
        },
        "ethereal-pulse": {
          "0%": { transform: "scale(0.8)", opacity: "0.3" },
          "100%": { transform: "scale(1.2)", opacity: "0.8" },
        },
        "orbit-spin": {
          to: { transform: "rotate(360deg)" },
        },
        "slot-active": {
          "0%": { transform: "scale(0.98)", filter: "saturate(0.86)" },
          "100%": { transform: "scale(1)", filter: "saturate(1)" },
        },
        "overlay-fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "overlay-fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "sheet-slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "sheet-slide-down": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "orb-pulse": "orb-pulse 6s ease-in-out infinite",
        "ethereal-pulse": "ethereal-pulse 3.5s infinite alternate ease-in-out",
        "orbit-spin": "orbit-spin 24s linear infinite",
        "slot-active": "slot-active 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
        "overlay-fade-in": "overlay-fade-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "overlay-fade-out": "overlay-fade-out 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "sheet-slide-up": "sheet-slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "sheet-slide-down": "sheet-slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "fade-in": "fade-in 0.5s ease forwards",
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
