/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan semua komponen di folder src
  ],
  theme: {
    extend: {
      colors: {
        // Kamu bisa tambahkan warna custom ala dashboard di sini
        emerald: {
          900: '#064e3b',
          // warna lainnya...
        }
      },
    },
  },
  plugins: [],
}