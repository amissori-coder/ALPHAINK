/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae2',
          300: '#aeb7c5',
          400: '#818ea3',
          500: '#637088',
          600: '#4d586d',
          700: '#3f4859',
          800: '#363d4b',
          900: '#1b1f27',
          950: '#0c0e13',
        },
        accent: {
          50: '#eefbf4',
          100: '#d6f5e3',
          200: '#afe9ca',
          300: '#7ed6ab',
          400: '#49bc89',
          500: '#25a06e',
          600: '#178058',
          700: '#136649',
          800: '#12513c',
          900: '#104333',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
        pop: '0 8px 24px rgba(16,24,40,0.08), 0 2px 6px rgba(16,24,40,0.04)',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
};
