import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.12)",
        card: "0 8px 20px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
