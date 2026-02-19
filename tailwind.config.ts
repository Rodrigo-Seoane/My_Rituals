import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          yellow: "#FFD115",
          brown: "#421E06",
          cream: "#FFF9F0",
          black: "#080D00",
          gray: "#686B63",
          "gray-light": "#C7C8C6",
          surface: "#F7F7F7",
          white: "#FFFFFF",
        },
        // Task category colors
        category: {
          personal: {
            DEFAULT: "#FFD115",
            bg: "#FFF9D6",
            text: "#421E06",
          },
          management: {
            DEFAULT: "#686B63",
            bg: "#EBEBEA",
            text: "#FFFFFF",
          },
          creation: {
            DEFAULT: "#421E06",
            bg: "#F0E8E3",
            text: "#FFF9F0",
          },
          consumption: {
            DEFAULT: "#3D6B4F",
            bg: "#E4F0E9",
            text: "#FFFFFF",
          },
          ideation: {
            DEFAULT: "#7C5230",
            bg: "#F2E9E2",
            text: "#FFFFFF",
          },
        },
        // shadcn/ui semantic tokens
        background: "#FFFFFF",
        foreground: "#080D00",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#080D00",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#080D00",
        },
        primary: {
          DEFAULT: "#FFD115",
          foreground: "#421E06",
        },
        secondary: {
          DEFAULT: "#F7F7F7",
          foreground: "#080D00",
        },
        muted: {
          DEFAULT: "#F7F7F7",
          foreground: "#686B63",
        },
        accent: {
          DEFAULT: "#FFF9F0",
          foreground: "#421E06",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        border: "#C7C8C6",
        input: "#C7C8C6",
        ring: "#FFD115",
      },
      fontFamily: {
        heading: ["var(--font-plus-jakarta)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        lg: "0.625rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
