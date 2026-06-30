import { useRouter } from "expo-router";
import { Search, Star } from "lucide-react-native";

import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Heading } from "@/components/ui/heading";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import {
  AMBER,
  BG,
  BORDER,
  CARD,
  FontSize,
  FontWeight,
  GREEN,
  MUTED,
  ORANGE,
  RED,
  SURFACE,
  TEXT,
} from "@/constants/palette";
import { ERA_COLORS, ERA_LABELS } from "@/features/characters/types";
import { useQuizzes } from "@/features/quiz/hooks/use-quizzes";
import type { QuizEra, QuizLevel, QuizSummary } from "@/features/quiz/types";

// ─── filter config ────────────────────────────────────────────────────────────
type EraFilter = QuizEra;
type LevelFilter = QuizLevel | "ALL";

const ERA_FILTER: { key: EraFilter; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "ANCIENT", label: ERA_LABELS.ANCIENT },
  { key: "MEDIEVAL", label: ERA_LABELS.MEDIEVAL },
  { key: "MODERN", label: ERA_LABELS.MODERN },
  { key: "CONTEMPORARY", label: ERA_LABELS.CONTEMPORARY },
];

const LEVEL_FILTER: { key: LevelFilter; label: string; color: string }[] = [
  { key: "ALL", label: "Tất cả", color: ORANGE },
  { key: "EASY", label: "Dễ", color: GREEN },
  { key: "MEDIUM", label: "Trung bình", color: AMBER },
  { key: "HARD", label: "Khó", color: RED },
];

const LEVEL_LABELS: Record<QuizLevel, string> = {
  EASY: "Dễ",
  MEDIUM: "Trung bình",
  HARD: "Khó",
};

const LEVEL_COLORS: Record<
  QuizLevel,
  { bg: string; text: string; border: string }
> = {
  EASY: { bg: `${GREEN}18`, text: GREEN, border: `${GREEN}40` },
  MEDIUM: { bg: `${AMBER}18`, text: AMBER, border: `${AMBER}40` },
  HARD: { bg: `${RED}18`, text: RED, border: `${RED}40` },
};

// ─── card ─────────────────────────────────────────────────────────────────────
function QuizCard({
  quiz,
  onPress,
}: {
  quiz: QuizSummary;
  onPress: () => void;
}) {
  const ec = ERA_COLORS[quiz.era as keyof typeof ERA_COLORS];
  const eraLabel = ERA_LABELS[quiz.era as keyof typeof ERA_LABELS] ?? quiz.era;
  const levelLabel = LEVEL_LABELS[quiz.level] ?? quiz.level;
  const lc = LEVEL_COLORS[quiz.level];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={s.card}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          marginBottom: 5,
        }}
      >
        <Text
          style={{ color: ec?.text ?? ORANGE, fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}
        >
          {eraLabel}
        </Text>
        {quiz.contextTitle ? (
          <Text
            style={{ color: MUTED, fontSize: FontSize.sm, flex: 1 }}
            numberOfLines={1}
          >
            · {quiz.contextTitle}
          </Text>
        ) : null}
      </View>
      <Text style={s.cardTitle} numberOfLines={2}>
        {quiz.title}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginTop: 6,
        }}
      >
        <Text
          style={{ color: lc?.text ?? ORANGE, fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}
        >
          {levelLabel}
        </Text>
        <Text style={s.statText}>· {quiz.playCount} lượt</Text>
      </View>
    </TouchableOpacity>
  );
}

function QuizSkeletons() {
  return (
    <View style={{ paddingHorizontal: 20, gap: 12 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} style={{ height: 96, borderRadius: 18 }} />
      ))}
    </View>
  );
}

// ─── screen ───────────────────────────────────────────────────────────────────
export default function QuizListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [era, setEra] = useState<EraFilter>("ALL");
  const [level, setLevel] = useState<LevelFilter>("ALL");

  const { data: quizzes, isLoading, isError } = useQuizzes(query || undefined);

  const filtered = useMemo(() => {
    if (!quizzes) return [];
    return quizzes.filter((q) => {
      const eraMatch = era === "ALL" || q.era === era;
      const levelMatch = level === "ALL" || q.level === level;
      return eraMatch && levelMatch;
    });
  }, [quizzes, era, level]);

  function submitSearch() {
    setQuery(search.trim());
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
      {/* header */}
      <View
        style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}
      >
        <Heading size="3xl">Bộ câu hỏi</Heading>
        <Text size="sm" muted className="mt-1">
          Kiểm tra kiến thức lịch sử qua các bộ câu hỏi
        </Text>
      </View>

      {/* search */}
      <View style={s.searchWrap}>
        <Search size={15} color={MUTED} strokeWidth={2} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={submitSearch}
          placeholder="Tìm bộ câu hỏi..."
          placeholderTextColor={MUTED}
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity
            onPress={() => {
              setSearch("");
              setQuery("");
            }}
          >
            <Text style={{ color: MUTED, fontSize: 13, paddingLeft: 8 }}>
              ×
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* era filter */}
      <View style={{ zIndex: 20, marginBottom: 12 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 7, paddingHorizontal: 20, paddingVertical: 3 }}
        style={{ overflow: 'visible' }}
      >
        {ERA_FILTER.map(({ key, label }) => {
          const active = era === key;
          const ec = key !== "ALL" ? ERA_COLORS[key as keyof typeof ERA_COLORS] : null;
          const activeBg = ec ? `${ec.text}18` : `${ORANGE}18`;
          const activeBorder = ec ? `${ec.text}55` : `${ORANGE}55`;
          const activeText = ec?.text ?? ORANGE;
          return (
            <Pressable
              key={key}
              onPress={() => setEra(key)}
              style={[
                s.pill,
                active
                  ? { backgroundColor: activeBg, borderColor: activeBorder }
                  : { backgroundColor: SURFACE, borderColor: BORDER },
              ]}
            >
              <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: active ? activeText : MUTED }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      </View>

      {/* count + difficulty filter */}
      <View style={s.countBar}>
        <Text style={s.countText}>{filtered.length} bộ câu hỏi</Text>
        <FilterDropdown
          label="Độ khó"
          options={LEVEL_FILTER}
          value={level}
          onChange={(v) => setLevel(v as LevelFilter)}
        />
      </View>

      {/* list */}
      {isLoading ? (
        <View style={{ marginTop: 4 }}>
          <QuizSkeletons />
        </View>
      ) : isError ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: MUTED }}>Không thể tải bộ câu hỏi</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(q) => q.quizId}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: 120,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60, gap: 12 }}>
              <Star size={40} color={MUTED} strokeWidth={1.25} />
              <Text style={{ color: MUTED, fontSize: 15 }}>
                {query || era !== "ALL" || level !== "ALL"
                  ? "Không tìm thấy kết quả"
                  : "Chưa có bộ câu hỏi"}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <QuizCard
              quiz={item}
              onPress={() =>
                router.push({
                  pathname: "/quiz/[id]",
                  params: { id: item.quizId },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: { flex: 1, marginLeft: 10, color: TEXT, fontSize: FontSize.md },

  countBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
    zIndex: 10,
  },
  countText: { color: MUTED, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    borderRadius: 99,
    borderWidth: 1,
    height: 32,
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardTitle: { color: TEXT, fontSize: FontSize.lg, fontWeight: FontWeight.bold, lineHeight: 21 },
  statText: { color: MUTED, fontSize: FontSize.sm },
});
