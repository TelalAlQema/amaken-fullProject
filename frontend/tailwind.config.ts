import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/shared/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#17c788",
          50: "#f0fdf7",
          100: "#dcfce9",
          200: "#bbf7d4",
          300: "#86efb2",
          400: "#4ade88",
          500: "#17c788",
          600: "#0fa96d",
          700: "#0d8758",
          800: "#0f6c48",
          900: "#0d583c",
          950: "#043120",
        },
        navy: {
          DEFAULT: "#0d1432",
          dark: "#091b4b",
          light: "#1a2150",
        },
        amaken: {
          green: "#17c788",
          "green-light": "rgba(11, 191, 141, 0.8)",
          dark: "#0d1432",
          "dark-deep": "#091b4b",
          gray: "#74777b",
          "gray-light": "#a3a7af",
          "gray-bg": "#f8f8f8",
          white: "#ffffff",
        },
      },
      fontFamily: {
        body: ["Muli", "sans-serif"],
        heading: ["Comfortaa", "cursive"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
