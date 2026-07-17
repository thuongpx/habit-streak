import { Platform } from 'react-native';

// ✅ Chỉ ID test của Google — không chỉnh sửa
export const TestIds = {
  ADAPTIVE_BANNER: Platform.select({
    android: 'ca-app-pub-3940256099942544/9214589741',
    ios: 'ca-app-pub-3940256099942544/2435281174',
  })!,
  BANNER: Platform.select({
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
  })!,
  INTERSTITIAL: Platform.select({
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
  })!,
  REWARDED: Platform.select({
    android: 'ca-app-pub-3940256099942544/5224354917',
    ios: 'ca-app-pub-3940256099942544/1712485313',
  })!,
};

// ✅ Chỉ ID thật của bạn — chỉ dùng khi production
export const AD_UNITS = {
  BANNER: Platform.select({
    android: 'ca-app-pub-xxx/yyy',       // thay ID thật Android
    ios: 'ca-app-pub-8329232441860385/4206385612',
  })!,
  INTERSTITIAL: Platform.select({
    android: 'ca-app-pub-xxx/zzz',
    ios: 'ca-app-pub-xxx/zzz',
  })!,
  REWARDED: Platform.select({
    android: 'ca-app-pub-xxx/www',
    ios: 'ca-app-pub-xxx/www',
  })!,
};

// ✅ Dùng chỗ này — tự động chọn đúng ID
export const getAdUnitId = (type: keyof typeof AD_UNITS) => {
  return __DEV__ ? TestIds[type] : AD_UNITS[type];
};