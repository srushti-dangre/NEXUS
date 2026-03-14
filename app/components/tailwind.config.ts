import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg:     "#030508",
          bg1:    "#060c12",
          bg2:    "#0a1520",
          glass:  "rgba(10,25,45,0.7)",
          border: "rgba(0,200,255,0.12)",
          cyan:   "#00c8ff",
          green:  "#00ff9d",
          red:    "#ff2d55",
          red2:   "#ff6b6b",
          amber:  "#ffbe00",
          white:  "#e8f4ff",
          dim:    "#4a7090",
          violet: "#a855f7",
        },
      },
      fontFamily: {
        display: ["Orbitron", "monospace"],
        body:    ["Rajdhani", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      animation: {
        ticker: "tick-scroll 22s linear infinite",
        fadeIn: "alin 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;