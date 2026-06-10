// src/hooks/useInterstitialAd.ts
import { useEffect, useRef } from 'react';
// import {
//   InterstitialAd,
//   AdEventType,
//   TestIds,
// } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import { AD_UNITS } from '../constants/theme';

// const adUnitId = __DEV__
//   ? TestIds.INTERSTITIAL
//   : Platform.OS === 'android'
//     ? AD_UNITS.INTERSTITIAL_ANDROID
//     : AD_UNITS.INTERSTITIAL_IOS;

// const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
//   requestNonPersonalizedAdsOnly: true,
// });

// export function useInterstitialAd() {
//   const isLoaded = useRef(false);

//   useEffect(() => {
//     // Pre-load ngay khi app khởi động
//     const unsubscribeLoaded = interstitial.addAdEventListener(
//       AdEventType.LOADED,
//       () => { isLoaded.current = true; }
//     );
//     const unsubscribeClosed = interstitial.addAdEventListener(
//       AdEventType.CLOSED,
//       () => {
//         // Reload ngay sau khi đóng để sẵn cho lần sau
//         isLoaded.current = false;
//         interstitial.load();
//       }
//     );
//     interstitial.load();
//     return () => {
//       unsubscribeLoaded();
//       unsubscribeClosed();
//     };
//   }, []);

//   // Gọi hàm này để hiển thị quảng cáo (nếu đã load xong)
//   const showIfReady = () => {
//     if (isLoaded.current) {
//       interstitial.show();
//     }
//   };

//   return { showIfReady };
// }

export function useInterstitialAd() {
  const showIfReady = () => {
    // Ads tạm thời bị vô hiệu hóa
    console.log('[Ad] Interstitial ad not available');
  };

  return { showIfReady };
}
