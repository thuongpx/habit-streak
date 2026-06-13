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

// Tần suất bắn Interstitial Ad (sau mỗi N lần tick)
export const INTERSTITIAL_EVERY = 5;

// Danh sách màu để chọn khi thêm habit (dùng trong AddHabitScreen)
export const COLORS_LIST: { key: 'c1' | 'c2' | 'c3' | 'c4' | 'c5'; main: string }[] = [
  { key: 'c3', main: COLORS.c3 },
  { key: 'c1', main: COLORS.c1 },
  { key: 'c4', main: COLORS.c4 },
  { key: 'c2', main: COLORS.c2 },
  { key: 'c5', main: COLORS.c5 },
];

// Icon gợi ý khi thêm habit
export const ICONS = [
  '💧','🏃','📚','🧘','😴','🥗','🎯','💪','✍️','🎵',
  '🌿','⚡','🏋️','🚴','🧹','💊','🫀','🧠','📝','🎨',
];

// Giờ / phút cho DrumPicker (Add Habit)
export const HOURS   = Array.from({ length: 24 }, (_, i) => i);
export const MINUTES = [0,5, 10, 15,20,  25, 30, 35, 40, 45, 50, 55] as const;

export const HABIT_TEMPLATES: {
  name: string;
  icon: string;
  color: 'c1' | 'c2' | 'c3' | 'c4' | 'c5';
  reminderHour: number;
  reminderMinute: number;
}[] = [
  { name: 'Uống 2L nước',     icon: '💧', color: 'c3', reminderHour: 9,  reminderMinute: 0 },
  { name: 'Tập thể dục',      icon: '🏃', color: 'c1', reminderHour: 6,  reminderMinute: 30 },
  { name: 'Đọc sách 30 phút', icon: '📚', color: 'c4', reminderHour: 21, reminderMinute: 0 },
  { name: 'Thiền 10 phút',    icon: '🧘', color: 'c2', reminderHour: 7,  reminderMinute: 0 },
  { name: 'Ngủ trước 23h',    icon: '😴', color: 'c5', reminderHour: 22, reminderMinute: 30 },
  { name: 'Ăn rau xanh',      icon: '🥗', color: 'c3', reminderHour: 12, reminderMinute: 0 },
];

// Theme accent cho Settings — màu mặc định + màu mở khoá qua Rewarded Ad
export const THEMES = [
  { key: 'c4', color: COLORS.c4, name: 'Tím (mặc định)', locked: false },
  { key: 'c3', color: COLORS.c3, name: 'Xanh teal',      locked: false },
  { key: 'c1', color: COLORS.c1, name: 'Đỏ san hô',      locked: true },
  { key: 'c2', color: COLORS.c2, name: 'Vàng cam',        locked: true },
  { key: 'c5', color: COLORS.c5, name: 'Vàng nắng',       locked: true },
] as const;

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

export const MESSAGES = [
  { icon: '🌅', title: 'Bắt đầu ngày mới!',       sub: 'Tick habit đầu tiên để khởi động nhé.' },
  { icon: '💪', title: 'Tốt lắm, tiếp tục!',       sub: 'Bạn đã làm được 1 habit rồi. Còn 4 nữa!' },
  { icon: '🚀', title: 'Đang có đà rồi!',           sub: 'Giữa chặng rồi, đừng dừng lại!' },
  { icon: '⚡', title: 'Gần xong rồi!',             sub: 'Chỉ còn 2 habit cuối cùng thôi!' },
  { icon: '🔥', title: 'Sắp hoàn thành!',           sub: 'Chỉ còn 1 habit nữa, đẩy hết sức nhé!' },
  { icon: '🎉', title: 'Hoàn hảo hôm nay!',         sub: 'Bạn đã tick đủ 5 habit. Tuyệt vời!' },
];