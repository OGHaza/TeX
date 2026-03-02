const colors = require('tailwindcss/colors')

// One Dark Pro (dark) inspired palette (darkened + punchier accents)
// Ref base: VS Code One Dark Pro theme colors
const oneDark = {
  // darker background/surfaces (vs classic #282c34)
  bg: '#11131a',
  surface: '#171a23',
  selection: '#2a2f3a',

  // slightly brighter foreground for contrast on darker bg
  fg: '#cfd6e6',
  muted: '#7b8496',

  // more saturated/brighter accents so highlights pop
  blue: '#7cc7ff',
  cyan: '#5de4ff',
  green: '#9afc8b',
  yellow: '#ffd37a',
  red: '#ff6b81',
  orange: '#ffb86c',
  purple: '#d79bff',

  // UI-specific surfaces
  menu: '#0b0d12',
  hover: '#22314a',
}

module.exports = {
    content: [
      './src/**/*.{html,js}',
    ], 
    theme: {
      
      extend: {
        colors: {
          "dark-full": oneDark.bg,
          "dark-gray": oneDark.surface,
          "one-dark": oneDark,
          gray: colors.neutral,
          primary: oneDark.blue,
        },
        spacing: {
          '58': '14.5rem',
          '37': '9.25rem',
        },
        transitionProperty: {
          'height': 'height',
          'max-height' : 'max-height'
        },
        height: {
          "screen3/2": "150vh",
          "screen3/4": "75vh",
          "screen/2": "50vh",
          "screen/3": "calc(100vh / 3)",
          "screen/4": "calc(100vh / 4)",
          "screen/5": "calc(100vh / 5)",
        },
        maxHeight: {
          "screen3/2": "150vh",
          "screen3/4": "75vh",
          "screen/2": "50vh",
          "screen/3": "calc(100vh / 3)",
          "screen/4": "calc(100vh / 4)",
          "screen/5": "calc(100vh / 5)",
         }
      }
    },
    variants: {
      extend: {
        opacity: ['active', 'group-focus'],
        pointerEvents: ['hover', 'focus', 'group-hover', 'group-focus'],
        fontSize: ['hover', 'focus'],
        textColor: ['group-focus']
      }
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('tailwindcss-textshadow'),
      require('tailwind-scrollbar-hide'),
      require('tailwind-scrollbar'),
      require('@tailwindcss/aspect-ratio'),
    ],
    corePlugins: {
     
    },
    
};
