import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--text)",
        muted: "var(--muted)",
        line: "var(--line)",
        ok: "var(--ok)",
        okbg: "var(--okbg)",
        low: "var(--low)",
        lowbg: "var(--lowbg)",
        out: "var(--out)",
        outbg: "var(--outbg)",
        accent: "var(--accent)",
        accenttext: "var(--accenttext)",
      },
      fontFamily: {
        sans: ["var(--font-bricolage)", "system-ui", "Segoe UI", "Arial", "sans-serif"],
      },
      keyframes: {
        sheetUp: {
          from: { transform: "translateY(24px)", opacity: "0" },
          to: { transform: "none", opacity: "1" },
        },
      },
      animation: {
        "sheet-up": "sheetUp .22s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
