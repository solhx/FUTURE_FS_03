/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf8f0",
          100: "#f9edd8",
          200: "#f2d9b0",
          300: "#e8c07d",
          400: "#dda04a",
          500: "#c9a96e",
          600: "#b8922a",
          700: "#9a7520",
          800: "#7d5e1d",
          900: "#654d1a",
        },
        sand: {
          50: "#fdf9f3",
          100: "#f9f0e3",
          200: "#f2dfc4",
          300: "#e8c99e",
          400: "#dbb07a",
          500: "#c9985c",
          600: "#b07d43",
          700: "#8f6235",
          800: "#734e2c",
          900: "#5e4026",
        },
        dark: {
          100: "#333333",
          200: "#2a2a2a",
          300: "#222222",
          400: "#1a1a1a",
          500: "#111111",
        },
      },
      fontFamily: {
        sans: ["Inter", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
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
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};