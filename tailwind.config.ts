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
          50: "#f8f4eb",
          100: "#efe7d0",
          200: "#e1cfa0",
          300: "#d2b56b",
          400: "#c49b3c",
          500: "#b3842a",
          600: "#8f6522",
          700: "#6d4b1c",
          800: "#4a3213",
          900: "#2d1f0b"
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
