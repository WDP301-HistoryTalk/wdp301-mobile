import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { BG } from "@/constants/palette";

const pattern = require("../../assets/images/copper-drum-pattern.webp");

/**
 * Nen hoa tiet trong dong (Dong Son) rat mo, dat phia sau toan bo cac man
 * hinh chinh (xem AppTabs) — man hinh ben tren phai de backgroundColor
 * "transparent" o container goc thi hoa tiet moi lo ra duoc.
 * Anh la 1 hinh tron (mat trong dong) — de nguyen ty le va nho hon be rong
 * man hinh (contain, khong cover) de khong bi phong to/cat mat.
 */
export function ScreenBackdrop() {
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: BG, alignItems: "center", justifyContent: "center" }]}
      pointerEvents="none"
    >
      <Image
        source={pattern}
        contentFit="contain"
        style={{
          width: "96%",
          aspectRatio: 1,
          opacity: 0.06,
          // Anh goc co nen vuong bao quanh hinh tron — bo tron cung de khong
          // lo canh vuong o do mo thap (vd de lo ranh gioi chinh xac cua anh).
          borderRadius: 9999,
        }}
      />
    </View>
  );
}
