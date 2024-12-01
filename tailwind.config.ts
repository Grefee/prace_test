import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        lightBg: "#ffffff",
        lightText: "#000000",
        lightHeader: "#475569",
        lightTableBg: "#ffffff",

        darkBg: "#363636",
        darkHeader: "#121212",
        darkText: "#ffffff",
        darkTableBg: "#8a8a8a",
      },
      gridTemplateColumns: {
        "30": "repeat(30, minmax(0, 1fr))",
      },
      gridColumn: {
        "span-30": "span 30 / span 30",
      },
    },
  },
  plugins: [],
} satisfies Config;
