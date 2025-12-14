/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"],
  safelist: [
    'bg-orange-500',
    'hover:bg-orange-600',
    'focus:ring-orange-500'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
