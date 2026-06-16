import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#B8975A",
          light: "#D4B483",
          dark: "#8B6E3A",
        },
        cream: "#F9F6F0",
        "cream-dark": "#EDE8DF",
        navy: {
          DEFAULT: "#1B2240",
          deep: "#11152A",
          light: "#3A4568",
        },
        "bohac-dark": "#161B2C",
        mid: "#34405E",
        muted: "#6B7280",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Jost", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
