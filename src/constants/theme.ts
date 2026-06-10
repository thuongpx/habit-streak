// src/constants/theme.ts
export const COLORS = {
  // Backgrounds
  bg:     '#0F0F1A',
  bg2:    '#181828',
  bg3:    '#1E1E32',
  card:   '#242438',
  card2:  '#2A2A42',
  border: 'rgba(255,255,255,0.07)',

  // Text
  text:   '#F0EFF8',
  muted:  '#9896B4',
  faint:  '#5E5C7A',

  // Habit accent colors (5 màu động lực)
  c1:   '#FF6B6B', c1l: '#FF8E8E', c1bg: 'rgba(255,107,107,0.12)',
  c2:   '#FFB347', c2l: '#FFC96A', c2bg: 'rgba(255,179,71,0.12)',
  c3:   '#4ECDC4', c3l: '#6EE0D9', c3bg: 'rgba(78,205,196,0.12)',
  c4:   '#A78BFA', c4l: '#C4B0FC', c4bg: 'rgba(167,139,250,0.12)',
  c5:   '#F9CA24', c5l: '#FBD94A', c5bg: 'rgba(249,202,36,0.12)',

  // Ads
  adBg: '#12121F',
} as const;

// 5 màu theo thứ tự cho habit
export const HABIT_COLORS = [
  { key: 'c1', main: COLORS.c1, light: COLORS.c1l, bg: COLORS.c1bg },
  { key: 'c2', main: COLORS.c2, light: COLORS.c2l, bg: COLORS.c2bg },
  { key: 'c3', main: COLORS.c3, light: COLORS.c3l, bg: COLORS.c3bg },
  { key: 'c4', main: COLORS.c4, light: COLORS.c4l, bg: COLORS.c4bg },
  { key: 'c5', main: COLORS.c5, light: COLORS.c5l, bg: COLORS.c5bg },
] as const;

export const MAX_HABITS = 5;

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
} as const;

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   18,
  full: 9999,
} as const;

// AdMob Unit IDs
// TODO: Thay bằng ID thật trước khi submit store
export const AD_UNITS = {
  // Dùng Test IDs khi dev, Real IDs khi release
  BANNER_ANDROID:       'ca-app-pub-3940256099942544/6300978111', // test
  BANNER_IOS:           'ca-app-pub-3940256099942544/2934735716', // test
  INTERSTITIAL_ANDROID: 'ca-app-pub-3940256099942544/1033173712', // test
  INTERSTITIAL_IOS:     'ca-app-pub-3940256099942544/4411468910', // test
  REWARDED_ANDROID:     'ca-app-pub-3940256099942544/5224354917', // test
  REWARDED_IOS:         'ca-app-pub-3940256099942544/1712485313', // test
} as const;
