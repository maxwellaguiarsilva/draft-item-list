import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg-color)",
        text: "var(--text-color)",
        border: "var(--border-color)",
        hover: "var(--hover-color)",
        accent: "var(--accent-color)",
        "accent-hover": "var(--accent-hover-color)",
        error: "var(--error-color)",
        menu: "var(--menu-bg)",
        "text-secondary": "var(--text-secondary-color)",
      },
    },
  },
  plugins: [],
};
export default config;
