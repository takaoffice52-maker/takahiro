import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        okinawa: {
          blue: "#0077b6",
          teal: "#00b4d8",
          light: "#90e0ef",
          sand: "#f5e6ca",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Hiragino Sans", "Meiryo", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
