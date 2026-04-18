/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          // Pure black background - icons.com style
          DEFAULT: '#000000',
          50: '#1a1a1a',
          100: '#0d0d0d',
          200: '#000000',
          300: '#000000',
          400: '#000000',
          500: '#000000',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
        foreground: {
          // Pure white text - icons.com style
          DEFAULT: '#FFFFFF',
          50: '#FFFFFF',
          100: '#FFFFFF',
          200: '#FFFFFF',
          300: '#F5F5F5',
          400: '#E5E5E5',
          500: '#D4D4D4',
          600: '#A3A3A3',
          700: '#737373',
          800: '#525252',
          900: '#404040',
        },
        button: {
          // Red button for primary actions - sports dynamic feel
          DEFAULT: '#DC2626', // Red-600
          text: '#FFFFFF',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        contrast: {
          // Dark grey for contrast elements
          DEFAULT: '#1a1a1a',
          50: '#3a3a3a',
          100: '#2d2d2d',
          200: '#1a1a1a',
          300: '#0d0d0d',
          400: '#000000',
          500: '#000000',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
        // Red color scale for highlights and accents
        red: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626', // Primary red
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        // Grey color scale for secondary elements
        grey: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        shadow: {
          // TouchMunyun shadow color: RGB(18, 18, 18) = #121212
          DEFAULT: '#121212',
        },
        'account-menu': {
          // Account menu dark black background: RGB(18, 18, 20) = #121214
          DEFAULT: '#121214',
        },
        dark: {
          DEFAULT: '#2d2d2d',
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#2d2d2d',
          800: '#262626',
          900: '#1a1a1a',
        },
        premium: {
          black: {
            DEFAULT: '#2d2d2d',
            50: '#3a3a3a',
            100: '#353535',
            200: '#2d2d2d',
            300: '#262626',
            400: '#1f1f1f',
            500: '#1a1a1a',
            // TouchMunyun dark gray variants
            charcoal: '#2d2d2d',
            'deep-slate': '#262626',
            'rich-black': '#1a1a1a',
            'velvet-black': '#1f1f1f',
          },
        },
        gold: {
          // Golden accents for premium highlights - icons.com style
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706', // Primary gold
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        accent: {
          // Context-based accent colors
          success: '#10b981', // Green for success
          warning: '#f59e0b', // Gold for warnings
          error: '#dc2626', // Red for errors
          info: '#3b82f6', // Blue for info
          red: '#dc2626', // Primary red accent
          gold: '#d97706', // Primary gold accent
          grey: '#6b7280', // Primary grey accent
        },
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-red-lg': '0 0 30px rgba(239, 68, 68, 0.5)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-gold-lg': '0 0 30px rgba(245, 158, 11, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-lg': '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
        'glass-red': '0 8px 32px 0 rgba(239, 68, 68, 0.2)',
        'glass-gold': '0 8px 32px 0 rgba(245, 158, 11, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

