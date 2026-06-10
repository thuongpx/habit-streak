// src/components/MotivationBanner.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const MESSAGES = [
  { icon: '🌅', title: 'Bắt đầu ngày mới!',       sub: 'Tick habit đầu tiên để khởi động nhé.' },
  { icon: '💪', title: 'Tốt lắm, tiếp tục!',       sub: 'Bạn đã làm được 1 habit rồi. Còn 4 nữa!' },
  { icon: '🚀', title: 'Đang có đà rồi!',           sub: 'Giữa chặng rồi, đừng dừng lại!' },
  { icon: '⚡', title: 'Gần xong rồi!',             sub: 'Chỉ còn 2 habit cuối cùng thôi!' },
  { icon: '🔥', title: 'Sắp hoàn thành!',           sub: 'Chỉ còn 1 habit nữa, đẩy hết sức nhé!' },
  { icon: '🎉', title: 'Hoàn hảo hôm nay!',         sub: 'Bạn đã tick đủ 5 habit. Tuyệt vời!' },
];

interface Props {
  done:  number;
  total: number;
}

export default function MotivationBanner({ done, total }: Props) {
  const msg = MESSAGES[Math.min(done, MESSAGES.length - 1)];
  const isAllDone = done >= total;

  return (
    <View style={[styles.wrap, isAllDone && styles.wrapDone]}>
      <Text style={styles.icon}>{msg.icon}</Text>
      <View style={styles.textWrap}>
        <Text style={[styles.title, isAllDone && styles.titleDone]}>
          {msg.title}
        </Text>
        <Text style={styles.sub}>{msg.sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             SPACING.md,
    marginHorizontal: SPACING.xl,
    marginTop:        SPACING.md,
    backgroundColor:  'rgba(167,139,250,0.10)',
    borderWidth:      1,
    borderColor:      'rgba(167,139,250,0.20)',
    borderRadius:     RADIUS.lg,
    padding:          SPACING.md,
  },
  wrapDone: {
    backgroundColor: 'rgba(78,205,196,0.12)',
    borderColor:     'rgba(78,205,196,0.28)',
  },
  icon: {
    fontSize: 26,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize:      13,
    fontWeight:    '800',
    color:         COLORS.text,
    marginBottom:  2,
  },
  titleDone: {
    color: COLORS.c3,
  },
  sub: {
    fontSize:   12,
    fontWeight: '600',
    color:      COLORS.muted,
    lineHeight: 17,
  },
});
