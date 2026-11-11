/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ===== Bảng màu Cute Green & White =====
        // brand: thang xanh lá chủ đạo (dùng cho thiết kế mới)
        brand: {
          50: '#F1F9F2',
          100: '#E8F6E9',
          200: '#D4E5D6',
          300: '#A8DDB5',
          400: '#75C98A',
          500: '#3FAE68',
          600: '#238B50',
          700: '#1A6B3D',
          800: '#15522F',
          900: '#263B2D',
        },
        // base: thang màu nền sáng (xanh pastel + trắng)
        base: {
          950: '#F7FBF7', // nền trang
          900: '#FFFFFF', // card / nổi bật
          850: '#F1F9F2', // panel mềm
          800: '#E8F6E9', // xanh pastel nhạt
          700: '#E4EEE5', // nút phụ / viền nhẹ
          600: '#D4E5D6', // hover
        },
        // neon -> màu xanh lá chủ đạo (giữ tên token để không phá class cũ)
        neon: {
          purple: '#238B50', // primary green
          violet: '#1A6B3D', // dark green
          cyan: '#238B50', // accent xanh đậm, đủ tương phản khi làm chữ/viền trên nền trắng
          blue: '#A8DDB5', // light green accent
        },
        // ink: màu xanh đậm dùng cho chữ/overlay thay cho trắng trên nền sáng
        ink: '#263B2D',
        // slate: thang xám xanh lá cho chữ (giá trị nhỏ = đậm để đọc trên nền sáng)
        slate: {
          50: '#FFFFFF',
          100: '#1F2E24',
          200: '#263B2D',
          300: '#2E3B33',
          400: '#4A5C52',
          500: '#6B7D72',
          600: '#829187',
          700: '#97A59B',
          800: '#A8B5AB',
          900: '#1A2B20',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Nunito', '"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 24px -12px rgba(38, 59, 45, 0.18)',
        card: '0 10px 30px -18px rgba(35, 139, 80, 0.30)',
        'card-hover': '0 18px 40px -20px rgba(35, 139, 80, 0.45)',
        glow: '0 0 0 1px rgba(35, 139, 80, 0.25), 0 12px 30px -14px rgba(35, 139, 80, 0.5)',
        'glow-cyan': '0 0 0 1px rgba(117, 201, 138, 0.35), 0 12px 30px -14px rgba(117, 201, 138, 0.55)',
        // Nút bấm: bóng mềm + viền sáng bên trong tạo cảm giác "glossy" hiện đại
        pop: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.4), 0 3px 0 -1px rgba(26, 107, 61, 0.32), 0 10px 20px -12px rgba(26, 107, 61, 0.55)',
        'btn-hover':
          'inset 0 1px 0 0 rgba(255, 255, 255, 0.5), 0 3px 0 -1px rgba(26, 107, 61, 0.28), 0 16px 30px -12px rgba(35, 139, 80, 0.6)',
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
