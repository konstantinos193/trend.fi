/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // TrendFi Dark Palette
        'void': '#030308',
        'deep': '#0a0a12',
        'surface': 'rgba(12, 12, 20, 0.85)',
        'elevated': 'rgba(18, 18, 28, 0.9)',
        'glass': 'rgba(255, 255, 255, 0.03)',
        'border-subtle': 'rgba(255, 255, 255, 0.06)',
        'border-dim': 'rgba(255, 255, 255, 0.1)',
        'border-glow': 'rgba(255, 255, 255, 0.15)',
        // Neon accents
        'neon-cyan': '#00f5d4',
        'neon-magenta': '#f72585',
        'neon-purple': '#7b2cbf',
        'neon-gold': '#ffc300',
        'neon-lime': '#b8f83a',
        // Text colors
        'text-primary': '#f0f0f5',
        'text-secondary': 'rgba(240, 240, 245, 0.7)',
        'text-muted': 'rgba(240, 240, 245, 0.45)',
        'text-dim': 'rgba(240, 240, 245, 0.25)',
      },
      fontFamily: {
        'display': ['Outfit', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neon-glow': 'linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(247, 37, 133, 0.1))',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 245, 212, 0.3)',
        'neon-magenta': '0 0 20px rgba(247, 37, 133, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 245, 212, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 245, 212, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
