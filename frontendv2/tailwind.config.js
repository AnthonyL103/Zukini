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
            DEFAULT: '#000000',
            hover: 'rgb(181, 160, 255)'
          },
          background: '#aaaaa7',
          surface: '#deded8',
          danger: '#eb4408',
          overlay: 'rgba(15, 6, 71, 0.4)'
        },
        height: {
          'screen-80': '80dvh',
          'screen-75': '75dvh'
        }
      },
    },
    plugins: [],
  }