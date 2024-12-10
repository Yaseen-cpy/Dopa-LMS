// tailwind.config.js
module.exports = {
  content: [
    "./index.html", // Include HTML files where Tailwind is used
    "./src/**/*.{js,jsx,ts,tsx}", // Include JavaScript, JSX, TypeScript, TSX files
    // Add other paths where Tailwind classes are used, such as in component libraries or custom directories
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
