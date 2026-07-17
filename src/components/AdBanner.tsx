// src/components/AdBanner.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { COLORS } from '../constants/theme';
import { getAdUnitId } from '../constants/ads';

const adUnitId = getAdUnitId('BANNER');

/**
 * AdBanner — dán cứng phía dưới màn hình
 * - Ẩn hoàn toàn nếu load thất bại (không chiếm không gian)
 * - Hiện khi load thành công
 */
export default function AdBanner() {
  const [adLoaded, setAdLoaded] = useState(false);

  return (
    <View style={[styles.container, !adLoaded && styles.hidden]}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true, // Phương án A
        }}
        onAdLoaded={() => setAdLoaded(true)}
        onAdFailedToLoad={(err) => {
          setAdLoaded(false);
          if (__DEV__) console.log('[Ad] Banner failed:', err);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.adBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hidden: {
    height: 0,
    overflow: 'hidden',
    borderTopWidth: 0,
  },
});