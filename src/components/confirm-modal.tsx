import { ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { AlertTriangle } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import {
  BORDER,
  CARD,
  MUTED,
  ORANGE,
  RED,
  SURFACE,
  TEXT,
  TEXT2,
} from "@/constants/palette";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: "default" | "danger";
  icon?: ReactNode;
  children?: ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "Dong y",
  cancelText = "Huy",
  loading = false,
  variant = "default",
  icon,
  children,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const accent = variant === "danger" ? RED : ORANGE;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => {
        if (!loading) onCancel?.();
      }}
    >
      <View style={s.backdrop}>
        <View style={s.card}>
          <View style={[s.iconWrap, { backgroundColor: `${accent}1A` }]}>
            {icon ?? <AlertTriangle size={22} color={accent} />}
          </View>
          <Text style={s.title}>{title}</Text>
          {message ? <Text style={s.message}>{message}</Text> : null}
          {children}
          <View style={s.actions}>
            {onCancel ? (
              <Pressable
                disabled={loading}
                onPress={onCancel}
                style={({ pressed }) => [
                  s.cancelBtn,
                  pressed ? s.pressed : null,
                ]}
              >
                <Text style={s.cancelText}>{cancelText}</Text>
              </Pressable>
            ) : null}
            <Pressable
              disabled={loading}
              onPress={onConfirm}
              style={({ pressed }) => [
                s.confirmBtn,
                { backgroundColor: accent },
                pressed || loading ? s.pressed : null,
                !onCancel ? s.fullWidth : null,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.confirmText}>{confirmText}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const confirmModalStyles = StyleSheet.create({
  detailPill: {
    color: TEXT2,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: SURFACE,
    alignSelf: "stretch",
  },
});

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    alignItems: "center",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    color: TEXT,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  message: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    alignSelf: "stretch",
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cancelText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "800",
  },
  confirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    flex: 0,
    width: "100%",
  },
  confirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.78,
  },
});
