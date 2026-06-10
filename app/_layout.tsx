// app/_layout.tsx
import { Stack }                  from 'expo-router';
import { SafeAreaProvider }       from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar }              from 'expo-status-bar';
import { StyleSheet }             from 'react-native';
import { useEffect }              from 'react';

export default function RootLayout() {
  useEffect(() => {
    // Khởi tạo AdMob SDK một lần duy nhất khi app start
    // MobileAds().initialize();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0F0F1A" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add-habit"  options={{ presentation: 'modal' }} />
          <Stack.Screen name="stats/[id]" options={{ presentation: 'card'  }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
