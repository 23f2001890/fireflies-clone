import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f2ff",
          100: "#ece7ff",
          200: "#d9d0ff",
          300: "#b9a8ff",
          400: "#9575ff",
          500: "#7c4dff",
          600: "#6b2fed",
          700: "#5a22c9",
          800: "#4a1da3",
          900: "#3d1a82",
        },
        ink: {
          900: "#14121f",
          800: "#211d33",
          700: "#312b49",
          600: "#4a4266",
          500: "#6c6489",
          400: "#8f89ab",
          300: "#b8b3d1",
          200: "#ddd9ee",
          100: "#efedf8",
          50: "#f8f7fc",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 18, 31, 0.06), 0 1px 12px rgba(20, 18, 31, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
