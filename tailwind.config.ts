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
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        // 原有
        blob: "blob 7s infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        // 新增：Portfolio 3D & Liquid Glass
        "gradient-shift": "gradientShift 12s ease infinite",
        "gradient-x": "gradientX 8s ease infinite",
        "spin-slow": "spin 20s linear infinite",
        "spin-reverse": "spinReverse 15s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "wa-glow": "waGlow 3s ease-in-out infinite",
        "count-up": "fadeInUp 0.6s ease-out forwards",
        "card-float": "cardFloat 6s ease-in-out infinite",
        "orb-drift": "orbDrift 20s ease-in-out infinite",
        "liquid-flow": "liquidFlow 8s ease-in-out infinite",
        "text-glow": "textGlow 3s ease-in-out infinite",
        "border-glow": "borderGlow 3s ease-in-out infinite",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        // 新 keyframes
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        spinReverse: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        cardFloat: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-8px) rotate(0.5deg)" },
          "66%": { transform: "translateY(-4px) rotate(-0.5deg)" },
        },
        orbDrift: {
          "0%": { transform: "translate(0%, 0%) scale(1)" },
          "25%": { transform: "translate(5%, -8%) scale(1.05)" },
          "50%": { transform: "translate(-3%, 5%) scale(0.95)" },
          "75%": { transform: "translate(8%, 3%) scale(1.03)" },
          "100%": { transform: "translate(0%, 0%) scale(1)" },
        },
        liquidFlow: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "25%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "50%": { borderRadius: "50% 60% 30% 60% / 30% 60% 70% 40%" },
          "75%": { borderRadius: "60% 40% 60% 30% / 60% 30% 40% 70%" },
        },
        textGlow: {
          "0%, 100%": { textShadow: "0 0 20px rgba(245, 166, 35, 0)" },
          "50%": { textShadow: "0 0 40px rgba(245, 166, 35, 0.6), 0 0 80px rgba(245, 166, 35, 0.3)" },
        },
        borderGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(245, 166, 35, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(245, 166, 35, 0.8), 0 0 40px rgba(245, 166, 35, 0.4)" },
        },
        waGlow: {
          "0%, 100%": { boxShadow: "0 4px 24px rgba(37, 211, 102, 0.45)" },
          "50%":       { boxShadow: "0 6px 36px rgba(37, 211, 102, 0.70), 0 0 60px rgba(37, 211, 102, 0.25)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "60px",
        "4xl": "80px",
      },
    },
  },
  plugins: [],
};
export default config;
