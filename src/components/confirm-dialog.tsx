import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { BORDER, CARD, MUTED, ORANGE, RED, TEXT, TEXT2 } from '@/constants/palette';

// `Alert.alert()` from react-native is a no-op on react-native-web — this is a
// plain View-based dialog so confirm flows actually work on web too.
export function ConfirmDialog({
  visible,
  title,
  message,
  cancelText = 'Huỷ',
  confirmText = 'Đồng ý',
  destructive,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
  destructive?: boolean;
  onCancel?: () => void;
  onConfirm: () => void;
}) {
  if (!visible) return null;

  return (
    <View style={s.overlay}>
      <Pressable style={s.backdrop} onPress={onCancel ?? onConfirm} />
      <View style={s.card}>
        <Text style={s.title}>{title}</Text>
        {message ? <Text style={s.message}>{message}</Text> : null}
        <View style={s.actions}>
          {onCancel ? (
            <Pressable onPress={onCancel} style={s.cancelBtn}>
              <Text style={s.cancelText}>{cancelText}</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={onConfirm}
            style={[s.confirmBtn, destructive && s.confirmBtnDestructive, !onCancel && { flex: 1 }]}
          >
            <Text style={s.confirmText}>{confirmText}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(43,33,24,0.45)',
  },
  card: {
    width: '85%',
    maxWidth: 360,
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: BORDER,
  },
  title: { color: TEXT, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  message: { color: TEXT2, fontSize: 13, lineHeight: 19, marginBottom: 18 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: 'rgba(43,33,24,0.06)', alignItems: 'center',
  },
  cancelText: { color: MUTED, fontWeight: '700', fontSize: 14 },
  confirmBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: ORANGE, alignItems: 'center',
  },
  confirmBtnDestructive: { backgroundColor: RED },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
