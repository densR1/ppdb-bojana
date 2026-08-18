/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Taken from the Landing Page repo so this matches the school site.
      colors: {
        primary: "#FFA901",
        "primary-dark": "#E09400",
        secondary: "#0082D6",
        "secondary-dark": "#00669F",
        navy: "#154E73",
        "navy-soft": "#3B84B8",
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
  plugins: [],
};
