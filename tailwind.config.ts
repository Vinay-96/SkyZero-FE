import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Custom colors for light/dark mode
        primary: {
          light: "#4F46E5", // Indigo-600
          dark: "#6366F1", // Indigo-500
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

