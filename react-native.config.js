module.exports = {
  dependencies: {
    'react-native-google-mobile-ads': {
      platforms: {
        ios: null, // Ép buộc bỏ qua Autolinking và quét Codegen trên iOS
        android: null, // Ép buộc bỏ qua Autolinking trên Android
      },
    },
  },
};