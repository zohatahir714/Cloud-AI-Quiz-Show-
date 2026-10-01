export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 950: "#060A18", 900: "#0A1128", 800: "#111B3A", 700: "#1C2A57", 600: "#2A3B73" },
        lav: { DEFAULT: "#B9A7FF", dim: "#8E7BE0" },
        cy: { DEFAULT: "#22E4FF" },
        hot: { DEFAULT: "#FF2D78" },
        ink: "#E9EDFF",
      },
      fontFamily: {
        sans: ["Sora", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        glow: {
          "0%,100%": { boxShadow: "0 0 0 1px rgba(185,167,255,.6), 0 0 8px rgba(185,167,255,.2)" },
          "50%": { boxShadow: "0 0 0 1px rgba(185,167,255,.9), 0 0 26px rgba(185,167,255,.5)" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        scan: { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(300%)" } },
        blink: { "50%": { opacity: "0" } },
      },
      animation: {
        fadeUp: "fadeUp .45s ease-out both",
        glow: "glow 1.1s ease-in-out infinite",
        shake: "shake .45s ease-in-out",
        scan: "scan 1.4s linear infinite",
        blink: "blink 1s steps(1) infinite",
      },
    },
  },
  plugins: [],
};