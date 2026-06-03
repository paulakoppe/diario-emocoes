import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FFFBF7",
          100: "#FFF8F3",
          200: "#FFEFE4",
        },
        blush: {
          100: "#FDE8EC",
          200: "#FACFD7",
          300: "#F4B6C2",
          400: "#EC91A4",
          500: "#DC6E85",
        },
        mint: {
          100: "#E6F4EE",
          200: "#CFEADF",
          300: "#B8E0D2",
          400: "#8FCCB6",
        },
        lavender: {
          100: "#F1E6F8",
          200: "#E2CDF1",
          300: "#D4A5E8",
          400: "#B97FD1",
        },
        butter: {
          100: "#FFF5DB",
          200: "#FFE9B0",
          300: "#FFDC85",
        },
        ink: {
          400: "#7A7470",
          500: "#5A5450",
          600: "#4A4440",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-quicksand)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px -4px rgba(220, 110, 133, 0.15)",
        "soft-lg": "0 10px 40px -10px rgba(220, 110, 133, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pop": "pop 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.95)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
