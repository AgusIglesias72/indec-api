// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-clear-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        righteous: ["var(--font-righteous)", "cursive"],

      },
      colors: {
        // Paleta principal inspirada en INDEC (azules, blancos, grises)
        indec: {
          blue: {
            light: '#4D89C8',  // Azul claro
            DEFAULT: '#005288', // Azul principal INDEC
            dark: '#003E66',   // Azul oscuro
            50: '#F0F7FF',
            100: '#E0EFFF',
            200: '#B8DBFF',
            300: '#8FC7FF',
            400: '#5BA4FF',
            500: '#2A7FFC',
            600: '#0057D2',
            700: '#0046A8',
            800: '#003580',
            900: '#002A68',
          },
          gray: {
            light: '#F5F7FA',  // Gris muy claro para fondos
            DEFAULT: '#EAEDF2', // Gris claro para elementos secundarios
            medium: '#CFD5E0', // Gris medio para bordes
            dark: '#8C95A6',   // Gris oscuro para texto secundario
            50: '#F8F9FA',
            100: '#F1F3F5',
            200: '#E9ECF0',
            300: '#DFE3E8',
            400: '#C4CCD7',
            500: '#919EAE',
            600: '#6C7A8C',
            700: '#4A5568',
            800: '#2D3748',
            900: '#1A202C',
          },
          red: {
            DEFAULT: '#D10A10', // Para alertas o indicadores negativos
          },
          green: {
            DEFAULT: '#10893E', // Para indicadores positivos
          },
          // Colores para gráficos
          chart: {
            blue: '#005288',
            lightBlue: '#4D89C8',
            gray: '#8C95A6',
            lightGray: '#CFD5E0',
            orange: '#FF9F1C',
            green: '#10893E',
            red: '#D10A10',
            purple: '#6A4C93',
          },
        },
        // Mantener las variables CSS existentes
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
     
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;