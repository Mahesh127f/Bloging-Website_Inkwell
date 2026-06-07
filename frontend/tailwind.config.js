/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        }
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: theme('colors.gray.800'),
            a: { color: theme('colors.blue.600') },
            'h1,h2,h3': { fontFamily: theme('fontFamily.serif').join(',') },
            code: {
              backgroundColor: theme('colors.gray.100'),
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '400',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          }
        },
        dark: {
          css: {
            color: theme('colors.gray.200'),
            a: { color: theme('colors.blue.400') },
            'h1,h2,h3,h4': { color: theme('colors.gray.100') },
            strong: { color: theme('colors.gray.100') },
            code: { backgroundColor: theme('colors.gray.800'), color: theme('colors.gray.200') },
            blockquote: { color: theme('colors.gray.300'), borderLeftColor: theme('colors.gray.600') },
            pre: { backgroundColor: theme('colors.gray.900') },
          }
        }
      })
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
