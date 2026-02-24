/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#059669', // Emerald 600
          hover: '#047857',   // Emerald 700
          muted: '#d1fae5',   // Emerald 100
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f9fafb',   // Gray 50
        },
        text: {
          DEFAULT: '#111827', // Gray 900
          muted: '#6b7280',   // Gray 500
        }
      }
    },
  },
  plugins: [],
}
