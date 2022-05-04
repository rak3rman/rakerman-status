module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./*.vue",
    "./plugins/**/*.{js,ts}",
  ],
  theme: {
    // extend: {
    //   fontFamily: {
    //     mono: 'Andale Mono',
    //     sans: 'Futura'
    //   },
    // },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
  ],
  // daisyui: {
  //   themes: [
  //     {
  //       'pulqra': {
  //         "primary": "#E8E8E8", // Primary theme color (logo, buttons)
  //         "primary-content": "#2E2E2E",
  //         "secondary": "#000000", // Secondary theme color (alt icons)
  //         "secondary-content": "#2BFB02",
  //       },
  //     },
  //   ],
  // },
}
