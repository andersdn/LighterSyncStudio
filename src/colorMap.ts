/** Canonical colour-name → hex map used across the app (preview, export, swatches). */
const COLOR_HEXMAP: Record<string, string> = {
  // UI / Hat / Clothe Colors
  Black: '#262E33', Blue01: '#65C9FF', Blue02: '#5199E4', Blue03: '#25557C',
  Gray01: '#E6E6E6', Gray02: '#929598', Heather: '#3C4F5C', PastelBlue: '#B1E2FF',
  PastelGreen: '#A7FFC4', PastelOrange: '#FFDEB5', PastelRed: '#FFAFB9', PastelYellow: '#FFFFB1',
  Pink: '#FF488E', Red: '#FF5C5C', White: '#FFFFFF',
  // Skin tones
  Tanned: '#FD9841', Yellow: '#F8D25C', Pale: '#FFDBB4', Light: '#EDB98A', DarkBrown: '#AE5D29',
  Brown: '#724133', BrownDark: '#4A3123',
  // Hair / Facial-Hair colors
  Auburn: '#A55728', Blonde: '#B58143', BlondeGolden: '#D6B370', Platinum: '#ECDCBF',
  RedHair: '#C93305', SilverGray: '#E8E1E1', PastelPink: '#F59797', Blue: '#000fdb',
}

export default COLOR_HEXMAP
