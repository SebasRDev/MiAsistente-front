import type { Config } from 'tailwindcss';

import { heroui } from '@heroui/react';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: '#658864',
        secondary: '#A4CF85',
      },
      fontFamily: {
        'Trajan-pro': 'Trajan-pro',
        'Trajan-pro-bold': 'Trajan-pro-bold',
        'Swiss-regular': 'Swiss-regular',
        'Swiss-medium': 'Swiss-medium',
        'Swiss-bold': 'Swiss-bold',
      },
    },
  },
  plugins: [
    heroui({
      prefix: 'heroui', // prefix for themes variables
      addCommonColors: false, // override common colors (e.g. "blue", "green", "pink").
      defaultTheme: 'light', // default theme from the themes object
      defaultExtendTheme: 'light', // default theme to extend on custom themes
      layout: {}, // common layout tokens (applied to all themes)
      themes: {
        light: {
          layout: {}, // light theme layout tokens
          colors: {
            primary: {
              DEFAULT: '#658864',
              foreground: '#fff',
            },
          }, // light theme colors
        },
        // ... custom themes
      },
    }),
  ],
} satisfies Config;
