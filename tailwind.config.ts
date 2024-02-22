import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "bounce-up": "bounce-up 0.5s ease-in-out",
        "spin-fast": "spin 0.75s linear infinite",
        "fade-in": "fade-in 1s ease-in-out",
        "fade-in-half": "fade-in-half 1s ease-in-out",
        "fade-in-from-below": "fade-in-from-below 1s ease-in-out",
      },
      keyframes: {
        "bounce-up": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-15%)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "fade-in-half": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "0.5",
          },
        },
        "fade-in-from-below": {
          "0%": {
            opacity: "0",
            transform: "translateY(0.5rem)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
