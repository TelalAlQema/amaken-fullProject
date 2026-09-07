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
          DEFAULT: "#0E1033",
          50: "#E8E9EF",
          100: "#C5C7D6",
          200: "#9FA2B8",
          300: "#3B3E66",
          400: "#2A2D52",
          500: "#1A1D42",
          600: "#14163A",
          700: "#0E1033",
          800: "#0A0B26",
          900: "#06071A",
          950: "#03040D",
        },
        secondary: {
          DEFAULT: "#D7BC3B",
          50: "#FBF8EC",
          100: "#F5EECD",
          200: "#EFDFAA",
          300: "#E8D687",
          400: "#E0CA5F",
          500: "#D7BC3B",
          600: "#C4A82E",
          700: "#B89A2A",
          800: "#9A7F23",
          900: "#7C651C",
          950: "#5E4B15",
        },
        navy: {
          DEFAULT: "#0E1033",
          300: "#3B3E66",
          700: "#0E1033",
          900: "#0A0B26",
        },
        gold: {
          DEFAULT: "#D7BC3B",
          300: "#E8D687",
          700: "#B89A2A",
        },
        charcoal: "#231F20",
        amaken: {
          navy: "#0E1033",
          "navy-light": "#3B3E66",
          "navy-dark": "#0A0B26",
          gold: "#D7BC3B",
          "gold-light": "#E8D687",
          "gold-dark": "#B89A2A",
          charcoal: "#231F20",
          gray: "#74777b",
          "gray-light": "#a3a7af",
          "gray-bg": "#F5F5F5",
          white: "#FFFFFF",
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
