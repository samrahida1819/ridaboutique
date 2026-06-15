import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#06281F",
          deep: "#031A15",
          sage: "#6F806D",
          gold: "#C9A45B",
          champagne: "#E7D7B2",
          cream: "#F7F2E8",
          ivory: "#FFFDF7",
          charcoal: "#181A17",
          mist: "#ECE7DA"
        }
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"]
      },
      boxShadow: {
        luxury: "0 24px 60px rgba(3, 26, 21, 0.14)",
        "gold-soft": "0 12px 36px rgba(201, 164, 91, 0.18)"
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: []
};

export default config;
