/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sun: "#FFC93C",
        sky: "#4FB6E8",
        mint: "#4ECDC4",
        orange: "#FF8C42",
        hq: {
          ink: "#12151C",
          panel: "#191D26",
          line: "#262B36",
        },
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
