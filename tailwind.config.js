/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ===== Bảng màu Cute Green & White (neon) =====
        // brand: 50–500 là thang xanh neon (dùng cho nền nút/CTA + nền pastel)
        //        600–900 là xanh đậm (dùng cho chữ, viền, ink để đảm bảo tương phản trên nền trắng)
        brand: {
          50: '#EFFDEF',
          100: '#DFFBDF',
          200: '#C0F8C0',
          300: '#8CF58C',
          400: '#5CFF5C',
          500: '#33FF33', // màu xanh neon chủ đạo
          600: '#238B50', // xanh đậm — chữ/viền đọc rõ trên nền trắng
          700: '#1A6B3D',
          800: '#15522F',
          900: '#263B2D',
        },
        // base: thang màu nền sáng (xanh pastel + trắng)
        base: {
          950: '#F6FDF6', // nền trang
          900: '#FFFFFF', // card / nổi bật
          850: '#EFFDEF', // panel mềm
          800: '#DFFBDF', // xanh pastel nhạt
          700: '#D6F5D6', // nút phụ / viền nhẹ
          600: '#C0F8C0', // hover
        },
        // neon -> xanh đậm đọc rõ trên nền sáng (giữ tên token để không phá class cũ)
        neon: {
          purple: '#1A6B3D', // dark green
          violet: '#15522F', // darker green
          cyan: '#238B50', // accent xanh đậm, đủ tương phản khi làm chữ/viền trên nền trắng
          blue: '#8CF58C', // light neon accent (dùng cho nền/trang trí)
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
        'card-hover': '0 16px 0 -10px rgba(35, 139, 80, 0.22), 0 20px 36px -22px rgba(26, 107, 61, 0.5)',
        glow: '0 0 0 1px rgba(35, 139, 80, 0.25), 0 12px 30px -14px rgba(35, 139, 80, 0.5)',
        'glow-cyan': '0 0 0 1px rgba(117, 201, 138, 0.35), 0 12px 30px -14px rgba(117, 201, 138, 0.55)',
        // Nút bấm: bóng mềm + viền sáng bên trong tạo cảm giác "glossy" hiện đại
        pop: 'inset 0 2px 0 0 rgba(255, 255, 255, 0.72), 0 4px 0 -1px rgba(26, 107, 61, 0.48), 0 10px 18px -10px rgba(26, 107, 61, 0.52)',
        'btn-hover':
          'inset 0 2px 0 0 rgba(255, 255, 255, 0.78), 0 4px 0 -1px rgba(26, 107, 61, 0.42), 0 18px 28px -12px rgba(35, 139, 80, 0.58)',
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
