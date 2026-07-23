import { FileText, TriangleAlert, X } from "lucide-react-native";
import { Linking, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  BORDER,
  CARD,
  MUTED,
  ORANGE,
  ORANGE_TINT_MUTED,
  SURFACE,
  TEXT,
} from "@/constants/palette";

import { usePublicCharacterDocuments, usePublicContextDocuments } from "./hooks";
import { findDocumentForQuote, splitContentByQuote } from "./quote-match";
import type { RagDocument } from "./types";

interface DocumentCitationModalProps {
  visible: boolean;
  onClose: () => void;
  characterId?: string;
  contextId?: string;
  /** Đoạn trích cần highlight + dùng để tìm tài liệu tương ứng. */
  quote?: string | null;
  /** Mở thẳng 1 tài liệu cụ thể (vào từ mục "Tài liệu tham khảo", không có quote). */
  initialDocumentId?: string | null;
}

export function DocumentCitationModal({
  visible,
  onClose,
  characterId,
  contextId,
  quote,
  initialDocumentId,
}: DocumentCitationModalProps) {
  const insets = useSafeAreaInsets();
  const { data: characterDocs = [], isLoading: isLoadingCharacterDocs } =
    usePublicCharacterDocuments(characterId);
  const { data: contextDocs = [], isLoading: isLoadingContextDocs } =
    usePublicContextDocuments(contextId);

  const documents: RagDocument[] = [...characterDocs, ...contextDocs];
  const isLoading = isLoadingCharacterDocs || isLoadingContextDocs;

  const matchedDocument = quote
    ? findDocumentForQuote(quote, documents)
    : initialDocumentId
      ? (documents.find((doc) => doc.id === initialDocumentId) ?? null)
      : null;

  const title = matchedDocument?.title || "Nguồn tham khảo";
  const parts = matchedDocument ? splitContentByQuote(matchedDocument.content, quote) : [];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={s.backdrop}>
        <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={s.header}>
            <View style={s.headerTitleRow}>
              <FileText size={18} color={ORANGE} strokeWidth={2.2} />
              <Text style={s.headerTitle} numberOfLines={1}>
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={s.closeBtn}>
              <X size={16} color={MUTED} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={s.body}
            contentContainerStyle={{ padding: 18 }}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <Spinner size="small" />
                <Text muted size="sm" style={{ marginTop: 8 }}>
                  Đang tải tài liệu...
                </Text>
              </View>
            ) : matchedDocument ? (
              <>
                <Text style={s.content}>
                  {parts.map((part, i) =>
                    part.matched ? (
                      <Text key={i} style={s.highlight}>
                        {part.text}
                      </Text>
                    ) : (
                      <Text key={i}>{part.text}</Text>
                    ),
                  )}
                </Text>
                {matchedDocument.fileUrl ? (
                  <TouchableOpacity
                    onPress={() => void Linking.openURL(matchedDocument.fileUrl!)}
                    activeOpacity={0.7}
                    style={s.fileLink}
                  >
                    <Text style={s.fileLinkText}>Xem file gốc ↗</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : (
              <View style={s.notFoundBox}>
                <View style={s.notFoundRow}>
                  <TriangleAlert size={16} color={MUTED} strokeWidth={2} />
                  <Text muted size="sm" style={{ flex: 1, lineHeight: 19 }}>
                    Không tìm thấy vị trí chính xác trong tài liệu. Đây là nội dung AI đã trích dẫn:
                  </Text>
                </View>
                {quote ? (
                  <Text style={s.quoteFallback}>{quote}</Text>
                ) : null}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "82%",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: CARD,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  headerTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
    flexShrink: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  body: {
    flexShrink: 1,
  },
  content: {
    color: TEXT,
    fontSize: 14,
    lineHeight: 22,
  },
  highlight: {
    backgroundColor: ORANGE_TINT_MUTED,
    color: TEXT,
    fontWeight: "700",
  },
  fileLink: {
    marginTop: 16,
    alignSelf: "flex-start",
  },
  fileLinkText: {
    color: ORANGE,
    fontSize: 13,
    fontWeight: "700",
  },
  notFoundBox: {
    gap: 10,
  },
  notFoundRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
  },
  quoteFallback: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    borderLeftWidth: 2,
    borderLeftColor: ORANGE,
    paddingLeft: 10,
  },
});
