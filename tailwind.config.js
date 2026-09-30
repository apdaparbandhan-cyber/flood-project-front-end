/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- यह लाइन होना सबसे ज़रूरी है
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}