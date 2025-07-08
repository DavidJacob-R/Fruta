import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF8700',
          light: '#FFB74D',
          dark: '#C56000'
        },
        secondary: {
          DEFAULT: '#22223B',
          light: '#4A4E69',
          dark: '#18182F'
        },
        success: '#38A169',
        danger: '#E53E3E',
        // ...agrega más según tus necesidades
      },
      // puedes agregar animaciones, fuentes, etc aquí también
    }
  },
  plugins: []
}

export default config
