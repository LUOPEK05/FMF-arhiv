import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F6F2",
        ink: "#1C1E1B",
        chalkboard: "#1F2A24",
        chalkboardDark: "#15181A",
        chalk: "#E9E6DC",
      },
    },
  },
  plugins: [],
};

export default config;