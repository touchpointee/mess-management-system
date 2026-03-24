import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#C0392B",
        "primary-soft": "#FCEDEA",
        "active-green": "#27AE60",
        background: "#F5F5F5",
        slatebg: "#F8FAFC",
        border: "hsl(var(--border))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
