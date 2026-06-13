// src/components/NotificationPermissionModal.tsx
import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface Props {
  visible:  boolean;
  onAllow:  () => void;
  onSkip:   () => void;
}

/**
 * Modal giải thích trước khi hệ thống hiện popup xin quyền notification.
 * Theo guideline của Apple: nên giải thích "pre-permission" trước khi gọi
 * requestPermissionsAsync(), để tăng tỉ lệ user bấm "Allow" ở popup hệ thống.
 */
export default function NotificationPermissionModal({ visible, onAllow, onSkip }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>🔔</Text>
          </View>

          <Text style={styles.title}>Đừng bỏ lỡ streak!</Text>
          <Text style={styles.sub}>
            Habit Streak sẽ nhắc bạn đúng giờ mỗi ngày để duy trì chuỗi habit.
            Bạn có thể tắt bất cứ lúc nào trong Cài đặt.
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onAllow();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Bật thông báo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => {
              Haptics.selectionAsync();
              onSkip();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.skipBtnText}>Bỏ qua</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,179,71,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  icon: { fontSize: 32, lineHeight: 38 },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: COLORS.c4,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  skipBtn: {
    paddingVertical: 10,
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.faint,
  },
});
