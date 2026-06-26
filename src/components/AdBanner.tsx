// src/components/AdBanner.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import { COLORS, AD_UNITS } from '../constants/theme';
import { TestIds } from '../constants/ads';

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.select({
      android: AD_UNITS.BANNER_ANDROID,
      ios: AD_UNITS.BANNER_IOS,
    })!;

/**
 * AdBanner — dán cứng phía dưới màn hình
 * - Ẩn hoàn toàn nếu load thất bại (không chiếm không gian)
 * - Hiện khi load thành công
 */
export default function AdBanner() {
  const [adLoaded, setAdLoaded] = useState(false);
  return (
    // Ẩn View khi chưa load xong → không chiếm không gian
    <View style={[styles.container, !adLoaded && styles.hidden]}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          setAdLoaded(true);
        }}
        onAdFailedToLoad={(err) => {
          setAdLoaded(false);
          if (__DEV__) console.log('Banner ad failed:', err);
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