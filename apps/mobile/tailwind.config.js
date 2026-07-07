/** @type {import('tailwindcss').Config} */

module.exports = {
  // NOTE: Update this to include the paths to all files that contain NativeWind classes.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      /**
       * Shadcn-compatible semantic color tokens.
       * Values are CSS variables defined in global.css as HSL channels.
       * Usage: bg-background, text-foreground, border-border, etc.
       */
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },

        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },

        // Brand utilities
        'untis-orange': '#ff6033',
        transparent: 'transparent',
        current: 'currentColor',
        white: '#FFFFFF',
      },

      borderRadius: {
        sm: 'calc(var(--radius) * 0.6)',
        md: 'calc(var(--radius) * 0.8)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) * 1.4)',
        '2xl': 'calc(var(--radius) * 1.8)',
        '3xl': 'calc(var(--radius) * 2.2)',
        '4xl': 'calc(var(--radius) * 2.6)',
      },

      fontFamily: {
        // MartianGrotesk — Academi.fy's signature font
        'martian-black-narrow': ['MartianGrotesk-NrBl'],
        'martian-black': ['MartianGrotesk-StdBl'],
        'martian-regular': ['MartianGrotesk-StdRg'],
        'martian-medium': ['MartianGrotesk-StdMd'],
        'martian-extrabold': ['MartianGrotesk-StdxBd'],
        'martian-black-wide': ['MartianGrotesk-sWdBl'],
      },

      /**
       * Brutalist hard-offset box shadows.
       * These give elements the sketchy/cartoony look.
       */
      boxShadow: {
        brutal: '3px 3px 0px 0px hsl(var(--foreground))',
        'brutal-sm': '2px 2px 0px 0px hsl(var(--foreground))',
        'brutal-lg': '5px 5px 0px 0px hsl(var(--foreground))',
        'brutal-primary': '3px 3px 0px 0px hsl(var(--primary))',
      },
    },
  },
  plugins: [],
};
