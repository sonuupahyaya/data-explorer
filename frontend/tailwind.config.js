/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // PREMIUM LIGHT MODE
        'pearl': {
          50: '#FAFAF9',   // Off-white
          100: '#F5F5F3',  // Soft white
          200: '#EFEFED',  // Light cream
          300: '#E8E6E2',  // Light taupe
          400: '#DDD9D0',  // Warm gray
        },
        
        // PREMIUM DARK MODE
        'obsidian': {
          50: '#1F1E1B',   // Dark charcoal
          100: '#141310',  // Deep charcoal
          200: '#0A0805',  // Nearly black
          300: '#030200',  // Pure black
        },
        
        // PRIMARY ACCENT: SAPPHIRE (Royal Blue)
        'sapphire': {
          50: '#F0F5FF',
          100: '#E0EBFF',
          200: '#C0D6FF',
          300: '#A0C2FF',
          400: '#6B9EFF',
          500: '#3B7FFF',  // True sapphire
          600: '#2E5FD8',
          700: '#2449B0',
          800: '#1A3488',
          900: '#0F1E50',
        },
        
        // SECONDARY ACCENT: SILVER / EMERALD
        'silver': {
          50: '#F9F9F9',
          100: '#F0F0F0',
          200: '#E0E0E0',
          300: '#C0C0C0',
          400: '#808080',
          500: '#606060',
          600: '#404040',
          700: '#202020',
          800: '#101010',
          900: '#050505',
        },
        
        'emerald-accent': {
          50: '#E8F5F1',
          100: '#C0E6DC',
          200: '#7ACBB0',
          300: '#4FB58E',
          400: '#369F6E',
          500: '#1F8A50', // Subtle emerald
          600: '#17664A',
          700: '#10443D',
          800: '#0A2A2A',
          900: '#051515',
        },
        
        // FALLBACK PRIMARY & NEUTRAL
        primary: {
          50: '#FAFAF9',
          100: '#F5F5F3',
          200: '#EFEFED',
          300: '#D8D6D0',
          400: '#A8A6A0',
          500: '#787470',
          600: '#4A4844',
          700: '#2A2622',
          800: '#1A1815',
          900: '#0F0D0B',
        },
        
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F3',
          200: '#EFEFED',
          300: '#D8D6D0',
          400: '#A8A6A0',
          500: '#787470',
          600: '#4A4844',
          700: '#2A2622',
          800: '#1A1815',
          900: '#0F0D0B',
        },
        
        // LEGACY ACCENT (mapped to sapphire)
        accent: {
          50: '#F0F5FF',
          100: '#E0EBFF',
          200: '#C0D6FF',
          300: '#A0C2FF',
          400: '#6B9EFF',
          500: '#3B7FFF',
          600: '#2E5FD8',
          700: '#2449B0',
          800: '#1A3488',
          900: '#0F1E50',
        },
        
        // LEGACY SECONDARY (mapped to emerald)
        secondary: {
          50: '#E8F5F1',
          100: '#C0E6DC',
          200: '#7ACBB0',
          300: '#4FB58E',
          400: '#369F6E',
          500: '#1F8A50',
          600: '#17664A',
          700: '#10443D',
          800: '#0A2A2A',
          900: '#051515',
        },
      },
      
      backgroundColor: {
        'glass': 'rgba(250, 250, 248, 0.75)',
        'glass-dark': 'rgba(20, 19, 16, 0.75)',
        'overlay': 'rgba(0, 0, 0, 0.5)',
        'overlay-light': 'rgba(255, 255, 255, 0.5)',
      },
      
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '24px',
      },
      
      boxShadow: {
        'thin': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
        'hover': '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        
        // SAPPHIRE GLOW
        'glow-sapphire': '0 0 20px rgba(59, 127, 255, 0.25)',
        'glow-sapphire-lg': '0 0 40px rgba(59, 127, 255, 0.35)',
        'glow-sapphire-dark': '0 0 30px rgba(59, 127, 255, 0.15)',
        
        // EMERALD GLOW
        'glow-emerald': '0 0 20px rgba(31, 138, 80, 0.25)',
        'glow-emerald-lg': '0 0 40px rgba(31, 138, 80, 0.35)',
        'glow-emerald-dark': '0 0 30px rgba(31, 138, 80, 0.15)',
        
        // LUXURY SHADOWS
        'luxury': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'luxury-hover': '0 20px 60px rgba(0, 0, 0, 0.12)',
        'luxury-dark': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'luxury-glass': 'inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.08)',
        'luxury-glass-dark': 'inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.2)',
      },
      
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.6s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'gentle-float': 'gentle-float 8s ease-in-out infinite',
        'drift': 'drift 20s ease-in-out infinite',
        'drift-slow': 'drift-slow 30s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'luxury-shadow': 'luxury-shadow 3s ease-in-out infinite',
      },
      
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'gentle-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'drift': {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '50%': { transform: 'translateX(20px) translateY(-10px)' },
        },
        'drift-slow': {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '50%': { transform: 'translateX(-25px) translateY(15px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 127, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 127, 255, 0.5)' },
        },
        'luxury-shadow': {
          '0%, 100%': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
          '50%': { boxShadow: '0 20px 60px rgba(0,0,0,0.12)' },
        },
      },
      
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'display': ['"Inter Display"', 'system-ui', 'sans-serif'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.5px' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.25px' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0px' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0px' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.5px' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.5px' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-1px' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-1px' }],
        '5xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-1.5px' }],
      },
      
      letterSpacing: {
        'tight': '-0.5px',
        'normal': '0px',
        'wide': '0.5px',
        'wider': '1px',
      },
    },
  },
  plugins: [],
}
