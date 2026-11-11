/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bảng màu Cute Cartoon Gaming: lime tươi, nền trắng/mint và accent pastel.
        brand: {
          50: '#F4FFF0',
          100: '#E8FADF',
          200: '#CFF3BD',
          300: '#A9EE89',
          400: '#8DEB68',
          500: '#62D943',
          600: '#269B35',
          700: '#207C2D',
          800: '#195F27',
          900: '#164820',
        },
        // Nền sáng cho app, surface và các vùng tương tác.
        base: {
          950: '#F4FFF0',
          900: '#FFFFFF',
          850: '#F4FFF0',
          800: '#E8FADF',
          700: '#D7EED0',
          600: '#C5E9B8',
        },
        pastel: {
          yellow: '#FFF3B8',
          orange: '#FFD8B5',
          blue: '#D9F1FF',
          pink: '#FFE1E7',
        },
        // Giữ alias cũ để các màn hình hiện hữu tiếp tục dùng token mà không cần đổi logic.
        neon: {
          purple: '#269B35',
          violet: '#207C2D',
          cyan: '#269B35',
          blue: '#8DEB68',
        },
        ink: '#164820',
        // Giữ thứ tự đảo hiện dùng trong giao diện sáng: text-slate-100 là chữ đậm.
        slate: {
          50: '#FFFFFF',
          100: '#203425',
          200: '#29442D',
          300: '#38523B',
          400: '#536957',
          500: '#708474',
          600: '#8A9B8C',
          700: '#A3B1A4',
          800: '#BDc8BE',
          900: '#19321F',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Nunito', '"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 24px -12px rgba(32, 124, 45, 0.16)',
        card: '0 10px 28px -18px rgba(38, 155, 53, 0.26)',
        'card-hover': '0 16px 0 -10px rgba(38, 155, 53, 0.18), 0 20px 36px -22px rgba(32, 124, 45, 0.36)',
        glow: '0 0 0 1px rgba(98, 217, 67, 0.28), 0 12px 30px -14px rgba(38, 155, 53, 0.4)',
        'glow-cyan': '0 0 0 1px rgba(141, 235, 104, 0.34), 0 12px 30px -14px rgba(98, 217, 67, 0.4)',
        'soft-3d': '0 5px 0 -1px rgba(32, 124, 45, 0.16), 0 12px 24px -12px rgba(32, 124, 45, 0.22)',
        reward: 'inset 0 2px 0 rgba(255,255,255,0.72), 0 4px 0 -1px rgba(195,125,25,0.38), 0 12px 22px -12px rgba(195,125,25,0.34)',
        // Bóng nổi có highlight dịu và gờ xanh như nút trong game mobile.
        pop: 'inset 0 2px 0 0 rgba(255, 255, 255, 0.72), 0 4px 0 -1px rgba(32, 124, 45, 0.38), 0 10px 18px -10px rgba(32, 124, 45, 0.4)',
        'btn-hover':
          'inset 0 2px 0 0 rgba(255, 255, 255, 0.8), 0 4px 0 -1px rgba(32, 124, 45, 0.34), 0 18px 28px -12px rgba(38, 155, 53, 0.42)',
        'inner-soft': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.7)',
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.5rem',
        '4xl': '2rem',
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
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        // Hiệu ứng "dễ thương" cho mascot và nhấn mạnh
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '70%': { transform: 'scale(1.03)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
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
        'float-y': 'float-y 4s ease-in-out infinite',
        wiggle: 'wiggle 1.6s ease-in-out infinite',
        'pop-in': 'pop-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        bob: 'bob 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
