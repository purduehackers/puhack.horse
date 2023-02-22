/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "bg-red-300",
    "bg-green-300",
    "bg-amber-300",
    "bg-blue-300",
    "bg-white",
  ],
  theme: {
    fontFamily: {
      sans: '"Space Grotesk", system-ui, Roboto, sans-serif',
      mono: '"Space Mono"',
    },
    extend: {
      boxShadow: {
        container: "6px 6px",
      },
      animation: {
        marquee: "marquee 25s linear infinite",
        marquee2: "marquee2 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
  },
  plugins: [],
};
