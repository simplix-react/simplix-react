/**
 * Tailwind preset mapping the simplix theme tokens (injected as CSS variables
 * by SimplixThemeProvider via NativeWind vars()) to utility color names.
 *
 * Consuming apps add this preset AFTER the NativeWind preset and include the
 * package sources in `content` so className extraction sees them:
 *
 *   // tailwind.config.js
 *   module.exports = {
 *     content: [
 *       "./app/**\/*.{ts,tsx}",
 *       "./node_modules/@simplix-react-native/ui/src/**\/*.{ts,tsx}",
 *     ],
 *     presets: [
 *       require("nativewind/preset"),
 *       require("@simplix-react-native/ui/tailwind-preset"),
 *     ],
 *   };
 */
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
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
          hover: "var(--primary-hover)",
          soft: "var(--primary-soft)",
          "soft-2": "var(--primary-soft-2)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        "muted-2": "var(--muted-2)",
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        "danger-soft": "var(--danger-soft)",
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warn-soft)",
        },
        info: "var(--info)",
        purple: {
          DEFAULT: "var(--purple)",
          soft: "var(--purple-soft)",
          "soft-2": "var(--purple-soft-2)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        input: "var(--input)",
        ring: "var(--ring)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
    },
  },
};
