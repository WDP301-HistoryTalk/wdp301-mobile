import { FileText, TriangleAlert, X } from "lucide-react-native";
import { useEffect, useMemo, useRef } from "react";
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

import { usePublicCharacterDocuments, usePublicContextsDocuments } from "./hooks";
import { findDocumentForQuote, splitContentByQuote, type QuoteTextPart } from "./quote-match";
import type { RagDocument } from "./types";

interface RenderLine {
  parts: QuoteTextPart[];
  hasMatch: boolean;
}

// splitContentByQuote() so khop tren TOAN BO content (khoang trang lien nhau,
// ke ca "\n", duoc coi la tuong duong — xem quote-match.ts), nen 1 doan trich
// dai co the trai qua nhieu dong van khop dung. Truoc day ham nay bi goi rieng
// tren TUNG DONG (content.split("\n") roi moi split-by-quote tung dong), nen
// hop khop nao trai qua ranh gioi dong (rat hay gap voi doan mo dau vi do
// thuong la doan dai nhat/hay duoc trich nhat) se khong dong dong nao chua
// tron ven ca cau -> mat highlight. Sua: split-by-quote tren toan bo content
// truoc, roi moi cat lai theo "\n" de dung cho onLayout/scroll-toi-dong.
function buildRenderLines(content: string, quote?: string | null): RenderLine[] {
  const globalParts = quote ? splitContentByQuote(content, quote) : [{ text: content, matched: false }];
  const lines: RenderLine[] = [{ parts: [], hasMatch: false }];

  for (const part of globalParts) {
    const segments = part.text.split("\n");
    segments.forEach((segment, idx) => {
      if (idx > 0) lines.push({ parts: [], hasMatch: false });
      if (!segment) return;
      const currentLine = lines[lines.length - 1];
      currentLine.parts.push({ text: segment, matched: part.matched });
      if (part.matched) currentLine.hasMatch = true;
    });
  }

  return lines;
}

interface DocumentCitationModalProps {
  visible: boolean;
  onClose: () => void;
  characterId?: string;
  contextId?: string;
  /**
   * Tất cả bối cảnh nhân vật này liên kết (1 nhân vật có thể gắn nhiều hơn 1
   * bối cảnh/file). Khi đối chiếu quote phải quét tài liệu của TẤT CẢ các
   * bối cảnh này, không chỉ riêng `contextId` — nếu không sẽ có trường hợp
   * AI trích dẫn đúng nhưng modal báo "không tìm thấy" chỉ vì tài liệu nguồn
   * thuộc một bối cảnh khác của cùng nhân vật.
   */
  contextIds?: string[];
  /** Đoạn trích cần highlight + dùng để tìm tài liệu tương ứng. */
  quote?: string | null;
  /** Mở thẳng 1 tài liệu cụ thể (vào từ mục "Tài liệu tham khảo", không có quote). */
  initialDocumentId?: string | null;
}

// Tach noi dung theo tung dong de co the do vi tri (onLayout chi dang tin cay
// tren View, khong tren Text long nhau) roi tu cuon toi dung dong chua trich
// dan — giu marginBottom 0 de van doc lien mach nhu 1 doan van.
function DocumentContent({
  content,
  quote,
  scrollRef,
}: {
  content: string;
  quote?: string | null;
  scrollRef: React.RefObject<ScrollView | null>;
}) {
  const renderLines = useMemo(() => buildRenderLines(content, quote), [content, quote]);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    hasScrolledRef.current = false;
  }, [content, quote]);

  return (
    <>
      {renderLines.map((line, i) => (
        <View
          key={i}
          onLayout={
            line.hasMatch
              ? (e) => {
                  if (hasScrolledRef.current) return;
                  hasScrolledRef.current = true;
                  const y = Math.max(e.nativeEvent.layout.y - 40, 0);
                  scrollRef.current?.scrollTo({ y, animated: true });
                }
              : undefined
          }
        >
          <Text style={s.content}>
            {line.parts.map((part, j) =>
              part.matched ? (
                <Text key={j} style={s.highlight}>
                  {part.text}
                </Text>
              ) : (
                <Text key={j}>{part.text}</Text>
              ),
            )}
          </Text>
        </View>
      ))}
    </>
  );
}

export function DocumentCitationModal({
  visible,
  onClose,
  characterId,
  contextId,
  contextIds,
  quote,
  initialDocumentId,
}: DocumentCitationModalProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { data: characterDocs = [], isLoading: isLoadingCharacterDocs } =
    usePublicCharacterDocuments(characterId);
  const { data: contextDocs = [], isLoading: isLoadingContextDocs } = usePublicContextsDocuments(
    contextIds && contextIds.length > 0 ? contextIds : contextId ? [contextId] : [],
  );

  const documents: RagDocument[] = [...characterDocs, ...contextDocs];
  const isLoading = isLoadingCharacterDocs || isLoadingContextDocs;

  const matchedDocument = quote
    ? findDocumentForQuote(quote, documents)
    : initialDocumentId
      ? (documents.find((doc) => doc.id === initialDocumentId) ?? null)
      : null;

  const title = matchedDocument?.title || "Nguồn tham khảo";

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
            ref={scrollRef}
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
                <DocumentContent content={matchedDocument.content} quote={quote} scrollRef={scrollRef} />
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
