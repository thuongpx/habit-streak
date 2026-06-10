// src/components/AdBanner.tsx
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
// import {
//   BannerAd,
//   BannerAdSize,
//   TestIds,
// } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, AD_UNITS } from '../constants/theme';

// const adUnitId = __DEV__
//   ? TestIds.ADAPTIVE_BANNER
//   : Platform.OS === 'android'
//     ? AD_UNITS.BANNER_ANDROID
//     : AD_UNITS.BANNER_IOS;

/**
 * AdBanner — dán cứng phía dưới màn hình
 * Nằm TRÊN tab bar, KHÔNG che bất kỳ nút nào
 * Height: ~52dp (ANCHORED_ADAPTIVE_BANNER tự co giãn)
 */
export default function AdBanner() {
  return (
    <View style={styles.container}>
      {/* <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={(err) => console.log('Banner ad failed:', err)}
      /> */}
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
    // Không cần paddingBottom vì tab bar nằm phía dưới component này
  },
});
