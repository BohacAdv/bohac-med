import type { Config } from "tailwindcss";

/**
 * Tokens espelham os custom properties de globals.css, que por sua vez
 * espelham o design system de bohac.com.br. Não divergir: /privacidade,
 * /termos e o login do /admin consomem exclusivamente estas cores.
 */
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
          DEFAULT: "#ae8167",
          light: "#c29a84",
          dark: "#99705a",
        },
        cream: "#fefaf7",
        "cream-dark": "#ebe0d9",
        navy: {
          DEFAULT: "#0f1a33",
          deep: "#0a1226",
          light: "#22304f",
        },
        "bohac-dark": "#0a1226",
        mid: "#35446b",
        muted: "#6a7189",
      },
      fontFamily: {
        // Uma só família em todo o grupo Bohac.
        sans: ["var(--font-jost)", "Century Gothic", "system-ui", "sans-serif"],
        serif: ["var(--font-jost)", "Century Gothic", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
