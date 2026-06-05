/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#000000',
        'bg-1': '#0a0a0a',
        'bg-2': '#111111',
        'bg-3': '#141414',
        'border-1': '#1a1a1a',
        'border-2': '#2a2a2a',
        'border-3': '#404040',
        'text-1': '#ffffff',
        'text-2': '#a0a0a0',
        'text-3': '#606060',
        'text-4': '#303030',
        'text-5': '#707070',
      },
      borderRadius: {
        none: '0',
        DEFAULT: '2px',
        sm: '2px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        full: '9999px',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
        rajdhani: ['Rajdhani', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        wider2: '0.1em',
        widest2: '0.15em',
        widest3: '0.2em',
      },
      boxShadow: {
        'glow-w': '0 0 0 1px #ffffff',
        'glow-w-soft': '0 0 12px rgba(255, 255, 255, 0.12)',
        'glow-w-faint': '0 0 18px rgba(255, 255, 255, 0.06)',
        'inset-w': 'inset 0 0 0 1px #2a2a2a',
      },
      keyframes: {
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '47%, 49%': { opacity: '0.98' },
          '50%': { opacity: '0.92' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,255,255,0.10)' },
          '50%':      { boxShadow: '0 0 0 4px rgba(255,255,255,0.20)' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',   opacity: '1' },
        },
        'blink-cursor': {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        'scan-horizontal': {
          '0%':   { left: '-100%' },
          '100%': { left: '100%'  },
        },
        'pulse-node': {
          '0%, 100%': { transform: 'scale(1)',   opacity: '0.85' },
          '50%':      { transform: 'scale(1.6)', opacity: '0.2'  },
        },
        'pulse-node-core': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.55' },
        },
      },
      animation: {
        'scanline':      'scanline 8s linear infinite',
        'flicker':       'flicker 4s steps(60) infinite',
        'pulse-glow':    'pulse-glow 2.4s ease-in-out infinite',
        'slide-in':      'slide-in-right 180ms ease-out',
        'blink-cursor':  'blink-cursor 1s steps(1) infinite',
        'scan-h':        'scan-horizontal 1.4s linear infinite',
        'pulse-node':    'pulse-node 1.6s ease-in-out infinite',
        'pulse-core':    'pulse-node-core 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
