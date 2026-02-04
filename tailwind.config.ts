import type { Config } from "tailwindcss";
import rtl from "tailwindcss-rtl";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f7fb",
          100: "#e2e8f0",
          200: "#cbd5e1",
          300: "#94a3b8",
          400: "#c9a646",
          500: "#b88c2d",
          600: "#8f6b1e",
          700: "#243141",
          800: "#18212c",
          900: "#0e141b"
        }
      },
      boxShadow: {
        soft: "0 18px 50px -30px rgba(24, 16, 2, 0.45)"
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
        "hero": "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0))"
      }
    }
  },
  plugins: [rtl]
};

export default config;
