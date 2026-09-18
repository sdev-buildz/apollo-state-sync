import '@mui/material'

// Augment the createTheme() parameter to accept tertiary color
declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary']
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary']
  }
}

// Augment the Button component to accept tertiary color
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    tertiary: true
  }
}
export {}
