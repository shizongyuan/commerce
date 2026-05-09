import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hermes: {
          orange: "#E65C00",
          "orange-light": "#FF7A2F",
          "orange-pale": "#FFF4EE",
        },
        apple: {
          gray: {
            1: "#1D1D1F",
            2: "#86868B",
            3: "#E5E5E7",
            4: "#FAFAFA",
          },
        },
      },
      fontFamily: {
        sans: ["SF Pro Text", "Noto Sans SC", "system-ui", "sans-serif"],
        display: ["SF Pro Display", "Noto Sans SC", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        apple: "8px",
      },
      maxWidth: {
        content: "1280px",
      },
      boxShadow: {
        apple: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "apple-lg": "0 4px 16px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
