/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores de Expoflores
        primary: {
          50: '#e6eef5',
          100: '#ccdde8',
          200: '#99bbd1',
          300: '#6699ba',
          400: '#3377a3',
          500: '#003366', // Azul Expoflores (principal)
          600: '#002952',
          700: '#001f3d',
          800: '#001429',
          900: '#000a14',
        },
        secondary: {
          50: '#f2f7ed',
          100: '#e5efdb',
          200: '#cbdfb7',
          300: '#b1cf93',
          400: '#97bf6f',
          500: '#669933', // Verde Vivo (sostenibilidad)
          600: '#527a29',
          700: '#3d5c1f',
          800: '#293d14',
          900: '#141f0a',
        },
        accent: {
          50: '#fce4ec',
          100: '#f8bbd0',
          200: '#f48fb1',
          300: '#f06292',
          400: '#ec407a',
          500: '#E91E63', // Rosa Intenso (CTAs)
          600: '#d81b60',
          700: '#c2185b',
          800: '#ad1457',
          900: '#880e4f',
        },
      },
      backgroundColor: {
        'app': '#F4F6F8', // Gris muy claro (fondo principal)
      },
      textColor: {
        'main': '#1A202C', // Casi negro (lectura general)
      },
    },
  },
  plugins: [],
}
