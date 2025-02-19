// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#283739',
          },
          secondary: {
            DEFAULT: '#2c5d63',
          },
          tertiery: {
            DEFAULT: '#a9c52f',
          },
          quaternary: {
            DEFAULT: '#f5f5f5',
          },
        },
        height: {
          'screen-80': '80dvh',
          'screen-75': '75dvh'
        }
      },
    },
    plugins: [],

  }