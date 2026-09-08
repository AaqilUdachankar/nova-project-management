/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#F5F5FA",
          100: "#E9E9F4",
          200: "#C9C9DE",
          300: "#9A9AB8",
          400: "#6B6B90",
          500: "#4A4A6A",
          600: "#34345A",
          700: "#252545",
          800: "#181832",
          900: "#0F0F24",
          950: "#0A0A1A",
        },
        nova: {
          50: "#F0F0FF",
          100: "#E1E1FF",
          200: "#C3C3FF",
          300: "#9F9DFB",
          400: "#7B76F4",
          500: "#5B54EC",
          600: "#4740D4",
          700: "#3730AC",
          800: "#2B2586",
          900: "#211C63",
        },
        flare: {
          50: "#FFF8EB",
          100: "#FFEDC7",
          200: "#FFDA8F",
          300: "#FFC259",
          400: "#FFA82E",
          500: "#F58B12",
          600: "#D66B0A",
        },
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 15, 36, 0.04), 0 4px 12px rgba(15, 15, 36, 0.06)",
        pop: "0 8px 24px rgba(15, 15, 36, 0.12)",
      },
      backgroundImage: {
        "nova-glow": "radial-gradient(circle at 20% 20%, rgba(91,84,236,0.25), transparent 55%)",
      },
    },
  },
  plugins: [],
};
