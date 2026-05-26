/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          soft: 'hsl(var(--primary-soft))',
          'soft-foreground': 'hsl(var(--primary-soft-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        'accent-warm': {
          DEFAULT: 'hsl(var(--accent-warm))',
          foreground: 'hsl(var(--accent-warm-foreground))',
          soft: 'hsl(var(--accent-warm-soft))',
          'soft-foreground': 'hsl(var(--accent-warm-soft-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        sm: '0 1px 3px 0 hsl(220 30% 15% / 0.08), 0 1px 2px -1px hsl(220 30% 15% / 0.06)',
        DEFAULT: '0 1px 3px 0 hsl(220 30% 15% / 0.10), 0 1px 2px -1px hsl(220 30% 15% / 0.08)',
        md: '0 4px 6px -1px hsl(220 30% 15% / 0.10), 0 2px 4px -2px hsl(220 30% 15% / 0.06)',
        lg: '0 4px 8px -2px hsl(220 30% 15% / 0.08), 0 12px 24px -4px hsl(220 30% 15% / 0.10)',
        xl: '0 20px 25px -5px hsl(220 30% 15% / 0.12), 0 8px 10px -6px hsl(220 30% 15% / 0.08)',
        '2xl': '0 25px 50px -12px hsl(220 30% 15% / 0.20)',
        'card-hover': '0 10px 20px -4px hsl(180 65% 32% / 0.15), 0 4px 8px -2px hsl(220 30% 15% / 0.06)',
        none: 'none',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
