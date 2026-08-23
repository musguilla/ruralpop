const isEquipop = process.env.APP_VARIANT === 'equipop';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: isEquipop ? '#1E3A8A' : '#059669', // Blue 900 for Equipop, Emerald 600 for Ruralpop
          hover: isEquipop ? '#1E40AF' : '#047857',   // Blue 800, Emerald 700
          muted: isEquipop ? '#DBEAFE' : '#d1fae5',   // Blue 100, Emerald 100
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
