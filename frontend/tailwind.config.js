/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f4ff",
          100: "#dce6ff",
          200: "#b9ccff",
          300: "#86a4ff",
          400: "#4d72ff",
          500: "#2952ff",
          600: "#1a3ef5",
          700: "#132ddb",
          800: "#1526b1",
          900: "#16258b",
          950: "#10185f",
        },
        accent: {
          50: "#f0fdf8",
          100: "#ccfbec",
          200: "#99f5d9",
          300: "#5de8c0",
          400: "#21d4a0",
          500: "#06bb89",
          600: "#009870",
          700: "#02795c",
          800: "#055f4a",
          900: "#064e3d",
        },
        surface: {
          50: "#f8f9fc",
          100: "#f1f3f9",
          200: "#e4e8f2",
          300: "#ced4e4",
          400: "#a8b3cc",
          500: "#7c8db0",
          600: "#5c6e96",
          700: "#475880",
          800: "#3a4868",
          900: "#2d3a55",
          950: "#1e2740",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)",
        "card-hover":
          "0 4px 16px -2px rgba(0,0,0,.10), 0 2px 6px -2px rgba(0,0,0,.06)",
        modal:
          "0 20px 60px -10px rgba(0,0,0,.25), 0 8px 20px -6px rgba(0,0,0,.12)",
        glow: "0 0 0 3px rgba(41,82,255,.20)",
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.25rem",
      },
    },
  },
  plugins: [],
};
