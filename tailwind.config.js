/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bảng màu chủ đạo: nền xanh đen / đen than, nhấn tím neon + cyan
        base: {
          950: '#070b16',
          900: '#0b1120',
          850: '#0f172a',
          800: '#131c31',
          700: '#1c2742',
          600: '#283653',
        },
        neon: {
          purple: '#a855f7',
          violet: '#8b5cf6',
          cyan: '#22d3ee',
          blue: '#38bdf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(0, 0, 0, 0.6)',
        glow: '0 0 0 1px rgba(168, 85, 247, 0.35), 0 8px 30px -10px rgba(168, 85, 247, 0.45)',
        'glow-cyan': '0 0 0 1px rgba(34, 211, 238, 0.35), 0 8px 30px -10px rgba(34, 211, 238, 0.45)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-slow': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'deal-card': {
          '0%': { opacity: '0', transform: 'translate(-40%, -160%) rotate(-18deg) scale(0.7)' },
          '100%': { opacity: '1', transform: 'translate(0, 0) rotate(0) scale(1)' },
        },
        'play-card': {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.85)' },
          '60%': { opacity: '1', transform: 'translateY(-6px) scale(1.02)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'float-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        'shuffle-card': {
          '0%': { transform: 'translate(-50%, -50%) rotate(-12deg)' },
          '25%': { transform: 'translate(calc(-50% + 28px), -50%) rotate(14deg)' },
          '50%': { transform: 'translate(calc(-50% - 24px), calc(-50% - 10px)) rotate(-8deg)' },
          '75%': { transform: 'translate(calc(-50% + 14px), calc(-50% + 16px)) rotate(10deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(-12deg)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-24px) rotate(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { transform: 'translateY(88vh) rotate(720deg)', opacity: '0' },
        },
        'coin-pop': {
          '0%': { transform: 'translateY(0) scale(0.4)', opacity: '0' },
          '30%': { transform: 'translateY(-12px) scale(1.1)', opacity: '1' },
          '100%': { transform: 'translateY(-78px) scale(0.9)', opacity: '0' },
        },
        'cut-flash': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '18%': { transform: 'scale(1.1)', opacity: '1' },
          '78%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        'white-win-pop': {
          '0%': { transform: 'scale(0.3) rotate(-8deg)', opacity: '0' },
          '55%': { transform: 'scale(1.15) rotate(2deg)', opacity: '1' },
          '75%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.02)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'fade-in-slow': 'fade-in-slow 0.6s ease-out both',
        'deal-card': 'deal-card 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'play-card': 'play-card 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'float-up': 'float-up 0.4s ease-out both',
        'pulse-ring': 'pulse-ring 1.2s ease-out infinite',
        'shuffle-card': 'shuffle-card 1s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 2.4s linear forwards',
        'coin-pop': 'coin-pop 1.1s ease-out forwards',
        'cut-flash': 'cut-flash 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'white-win-pop': 'white-win-pop 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
