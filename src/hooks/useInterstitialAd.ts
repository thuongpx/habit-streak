// src/hooks/useInterstitialAd.ts
import { useEffect, useRef } from 'react';
import {
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../constants/ads';

const adUnitId = getAdUnitId('INTERSTITIAL');

// Phương án A: chỉ dùng non-personalized ads, không cần ATT/UMP
const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

// Cooldown tối thiểu giữa 2 lần hiện interstitial (ms)
const MIN_INTERVAL_MS = 90 * 1000; // 90 giây

export function useInterstitialAd() {
  const isLoaded = useRef(false);
  const lastShownAt = useRef(0);

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => { isLoaded.current = true; }
    );
    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        isLoaded.current = false;
        interstitial.load(); // reload ngay cho lần sau
      }
    );
    const unsubscribeError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      (err) => {
        isLoaded.current = false;
        if (__DEV__) console.log('[Ad] Interstitial load error:', err);
        // Thử load lại sau 1 khoảng để không spam request khi mạng lỗi
        setTimeout(() => interstitial.load(), 30_000);
      }
    );

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const showIfReady = () => {
    const now = Date.now();
    if (!isLoaded.current) {
      if (__DEV__) console.log('[Ad] Interstitial not ready yet');
      return;
    }
    if (now - lastShownAt.current < MIN_INTERVAL_MS) {
      if (__DEV__) console.log('[Ad] Interstitial skipped — cooldown');
      return;
    }
    lastShownAt.current = now;
    interstitial.show();
  };

  return { showIfReady };
}