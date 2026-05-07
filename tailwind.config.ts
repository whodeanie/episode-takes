import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d3d8e0",
          300: "#a8b1bf",
          400: "#7a8499",
          500: "#525b6e",
          600: "#3a4254",
          700: "#262d3c",
          800: "#171c28",
          900: "#0c1018",
          950: "#070a12"
        },
        screen: {
          gold: "#E5B962",
          rose: "#E26B83",
          cyan: "#6BC8D8",
          mint: "#7FD8A1"
        }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "Helvetica", "Arial"],
        display: ["ui-serif", "Georgia", "Cambria", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
