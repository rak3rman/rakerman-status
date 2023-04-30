module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./*.vue",
    "./plugins/**/*.{js,ts}",
  ],
  plugins: [
    require("daisyui"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/aspect-ratio"),
  ],
  daisyui: {
    themes: [
      {
        default: {
          primary: "#FFFFFF", // Primary theme color (logo, buttons)
          secondary: "#586CB2", // Secondary theme color (alt icons)
          "secondary-content": "#FFFFFF",
          accent: "#000000",
          neutral: "#000000",
          success: "#059669",
          error: "#ef4444",
        },
      },
    ],
  },
};