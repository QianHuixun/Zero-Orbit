/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        void: "rgb(var(--color-void) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        cyan: "rgb(var(--color-cyan) / <alpha-value>)",
        violet: "rgb(var(--color-violet) / <alpha-value>)"
      },
      boxShadow: {
        glow: "0 0 32px rgb(var(--color-cyan) / 0.18)",
        panel: "0 24px 80px rgb(0 0 0 / 0.35)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "Liberation Mono", "monospace"]
      }
    }
  }
};
