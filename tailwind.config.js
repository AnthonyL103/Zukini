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
          primary: '#283739',
          secondary: '#2c5d63',
          tertiary: '#a9c52f',
          quaternary: '#f5f5f5',
        },
        height: {
          'screen-80': '80dvh',
          'screen-75': '75dvh'
        }
      },
    },
    plugins: [],

  }