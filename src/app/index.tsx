import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { BookOpen, ChevronRight, LogOut, MapPin, Mail, User, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useCharacters } from '@/features/characters/hooks/use-characters';
import { ERA_COLORS, ERA_LABELS, type Character, type CharacterEra } from '@/features/characters/types';
import { useHistoricalContexts } from '@/features/historical-contexts/hooks/use-historical-contexts';
import { formatContextYear, type HistoricalContext } from '@/features/historical-contexts/types';
import { useAuthStore } from '@/features/auth/store';

const ERA_CARD_BG: Record<CharacterEra, string> = {
  ANCIENT:      '#1C0E06',
  MEDIEVAL:     '#120828',
  MODERN:       '#061A18',
  CONTEMPORARY: '#071020',
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

// ─── Character portrait card (horizontal scroll) ──────────────────────────────
function CharPortrait({ char, onPress }: { char: Character; onPress: () => void }) {
  const ec     = char.era ? ERA_COLORS[char.era] : null;
  const cardBg = char.era ? ERA_CARD_BG[char.era] : '#18181b';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={{ width: 120 }}>
      <View style={{
        width: 120, height: 156, borderRadius: 20,
        backgroundColor: cardBg, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
      }}>
        {char.image ? (
          <Image source={{ uri: char.image }} style={{ position: 'absolute', width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 52, fontWeight: '900', color: ec?.text ?? '#fff', opacity: 0.18 }}>
              {char.name.charAt(0)}
            </Text>
          </View>
        )}
        {/* gradient */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 }}>
          <View style={{ flex: 1 }} />
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} />
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' }} />
        </View>
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 }}>
          {char.era && ec ? (
            <Badge style={{ backgroundColor: ec.bg, borderColor: `${ec.text}33`, marginBottom: 4, alignSelf: 'flex-start' }}>
              <BadgeText style={{ color: ec.text, fontSize: 8 }}>{ERA_LABELS[char.era]}</BadgeText>
            </Badge>
          ) : null}
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', lineHeight: 16 }} numberOfLines={2}>
            {char.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Context mini-row ─────────────────────────────────────────────────────────
function ContextRow({ ctx, onPress }: { ctx: HistoricalContext; onPress: () => void }) {
  const ec      = ERA_COLORS[ctx.era] ?? ERA_COLORS.ANCIENT;
  const cardBg  = ERA_CARD_BG[ctx.era] ?? '#1C0E06';
  const imgUri  = (ctx as any).imageUrl ?? ctx.image;
  const yearTxt = formatContextYear(ctx);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        backgroundColor: '#18181b',
        borderRadius: 18,
        padding: 12,
        gap: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <View style={{
        width: 60, height: 70, borderRadius: 14,
        backgroundColor: cardBg, overflow: 'hidden',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {imgUri ? (
          <Image source={{ uri: imgUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Text style={{ fontSize: 26, fontWeight: '900', color: ec.text, opacity: 0.65 }}>
            {ctx.name.charAt(0)}
          </Text>
        )}
      </View>

      <View style={{ flex: 1, justifyContent: 'center', gap: 4 }}>
        <Badge style={{ backgroundColor: ec.bg, borderColor: `${ec.text}30`, alignSelf: 'flex-start' }}>
          <BadgeText style={{ color: ec.text, fontSize: 9 }}>{ERA_LABELS[ctx.era]}</BadgeText>
        </Badge>
        <Text style={{ color: '#f4f4f5', fontSize: 14, fontWeight: '700', lineHeight: 19 }} numberOfLines={2}>
          {ctx.name}
        </Text>
        {(yearTxt ?? ctx.location) ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {ctx.location ? <MapPin size={10} color="#52525b" /> : null}
            <Text style={{ color: '#52525b', fontSize: 11 }} numberOfLines={1}>
              {[yearTxt, ctx.location].filter(Boolean).join(' · ')}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ justifyContent: 'center' }}>
        <ChevronRight size={16} color="#3f3f46" />
      </View>
    </TouchableOpacity>
  );
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────
function CharSkeletons() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} style={{ width: 120, height: 156 }} radius={20} />)}
    </ScrollView>
  );
}

function CtxSkeletons() {
  return (
    <View>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 10, backgroundColor: '#18181b', borderRadius: 18, padding: 12 }}>
          <Skeleton style={{ width: 60, height: 70 }} radius={14} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton style={{ height: 12, width: '45%' }} radius={6} />
            <Skeleton style={{ height: 16, width: '80%' }} radius={6} />
            <Skeleton style={{ height: 11, width: '60%' }} radius={6} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router    = useRouter();
  const user      = useAuthStore((s) => s.user);
  const logout    = useAuthStore((s) => s.logout);
  const initial   = user?.userName?.charAt(0).toUpperCase() ?? 'U';
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: charData, isLoading: charLoading } = useCharacters({});
  const { data: ctxData,  isLoading: ctxLoading  } = useHistoricalContexts({});

  const characters = charData?.pages[0]?.content?.slice(0, 8) ?? [];
  const contexts   = ctxData?.pages[0]?.content?.slice(0, 4) ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#09090b' }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image source={require('@/assets/logo.png')} style={{ width: 32, height: 32 }} contentFit="contain" />
            <View>
              <Text style={{ fontSize: 12, color: '#52525b' }}>{greeting()}</Text>
              <Heading size="lg" className="text-zinc-100">{user?.userName ?? 'Bạn'}</Heading>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setMenuOpen((v) => !v)}
            activeOpacity={0.8}
            style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#EA580C', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17 }}>{initial}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Hero banner ─────────────────────────────────────────── */}
        <View style={{
          marginHorizontal: 20, marginBottom: 28,
          borderRadius: 24, overflow: 'hidden',
          backgroundColor: '#18181b',
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        }}>
          {/* accent bar */}
          <View style={{ height: 3, backgroundColor: '#EA580C' }} />
          <View style={{ padding: 22 }}>
            <Badge style={{ backgroundColor: 'rgba(234,88,12,0.18)', borderColor: 'rgba(234,88,12,0.4)', alignSelf: 'flex-start', marginBottom: 12 }}>
              <BadgeText style={{ color: '#EA580C', fontSize: 10 }}>HistoryTalk</BadgeText>
            </Badge>
            <Heading size="2xl" className="text-zinc-100 leading-8" style={{ marginBottom: 8 }}>
              Khám phá lịch sử{'\n'}qua từng nhân vật
            </Heading>
            <Text size="sm" muted style={{ lineHeight: 20, marginBottom: 18 }}>
              Trò chuyện và tìm hiểu về các sự kiện, nhân vật lịch sử nổi tiếng Việt Nam và thế giới.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/characters')}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: '#EA580C', borderRadius: 14,
                paddingHorizontal: 18, paddingVertical: 12,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Bắt đầu ngay</Text>
              <ChevronRight size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Quick access ────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 32 }}>
          <TouchableOpacity
            onPress={() => router.push('/characters')}
            activeOpacity={0.8}
            style={{
              flex: 1, backgroundColor: '#18181b', borderRadius: 20,
              padding: 18, alignItems: 'center', gap: 10,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(234,88,12,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} color="#EA580C" strokeWidth={1.75} />
            </View>
            <Text style={{ color: '#f4f4f5', fontSize: 13, fontWeight: '700' }}>Nhân vật</Text>
            <Text style={{ color: '#52525b', fontSize: 11, textAlign: 'center', lineHeight: 16 }}>
              Danh sách nhân vật lịch sử
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/context')}
            activeOpacity={0.8}
            style={{
              flex: 1, backgroundColor: '#18181b', borderRadius: 20,
              padding: 18, alignItems: 'center', gap: 10,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(99,102,241,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={22} color="#818cf8" strokeWidth={1.75} />
            </View>
            <Text style={{ color: '#f4f4f5', fontSize: 13, fontWeight: '700' }}>Bối cảnh</Text>
            <Text style={{ color: '#52525b', fontSize: 11, textAlign: 'center', lineHeight: 16 }}>
              Sự kiện và giai đoạn lịch sử
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Characters ──────────────────────────────────────────── */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
            <Heading size="lg" className="text-zinc-100">Nhân vật nổi bật</Heading>
            <TouchableOpacity
              onPress={() => router.push('/characters')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
            >
              <Text style={{ color: '#EA580C', fontSize: 13, fontWeight: '600' }}>Xem tất cả</Text>
              <ChevronRight size={13} color="#EA580C" />
            </TouchableOpacity>
          </View>

          {charLoading ? (
            <CharSkeletons />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {characters.map((char) => (
                <CharPortrait
                  key={char.id}
                  char={char}
                  onPress={() => router.push({ pathname: '/characters/[id]', params: { id: char.id } })}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Contexts ────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Heading size="lg" className="text-zinc-100">Bối cảnh lịch sử</Heading>
            <TouchableOpacity
              onPress={() => router.push('/context')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
            >
              <Text style={{ color: '#EA580C', fontSize: 13, fontWeight: '600' }}>Xem tất cả</Text>
              <ChevronRight size={13} color="#EA580C" />
            </TouchableOpacity>
          </View>

          {ctxLoading ? (
            <CtxSkeletons />
          ) : (
            contexts.map((ctx) => (
              <ContextRow
                key={ctx.id}
                ctx={ctx}
                onPress={() => router.push({ pathname: '/context/[id]', params: { id: ctx.id } })}
              />
            ))
          )}
        </View>

      </ScrollView>

      {/* ── Avatar dropdown menu ────────────────────────────────── */}
      {menuOpen && (
        <>
          {/* Backdrop — tap anywhere to close */}
          <Pressable onPress={() => setMenuOpen(false)} style={StyleSheet.absoluteFill} />

          {/* Menu card */}
          <View style={styles.menu}>
            {/* User info */}
            <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#27272a' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#EA580C', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>{initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f4f4f5', fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
                    {user?.userName ?? 'Người dùng'}
                  </Text>
                  <Text style={{ color: '#52525b', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                    {user?.email ?? ''}
                  </Text>
                </View>
              </View>
              {/* Role badge */}
              <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(234,88,12,0.15)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(234,88,12,0.3)', paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text style={{ color: '#EA580C', fontSize: 11, fontWeight: '600' }}>
                  {user?.role === 'CUSTOMER' ? 'Người dùng' : user?.role ?? 'Người dùng'}
                </Text>
              </View>
            </View>

            {/* Menu items */}
            <View style={{ paddingVertical: 6 }}>
              <TouchableOpacity
                onPress={() => { setMenuOpen(false); router.push('/profile'); }}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}
              >
                <User size={16} color="#71717a" strokeWidth={1.75} />
                <Text style={{ color: '#d4d4d8', fontSize: 14, fontWeight: '500' }}>Hồ sơ cá nhân</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setMenuOpen(false); }}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}
              >
                <Mail size={16} color="#71717a" strokeWidth={1.75} />
                <Text style={{ color: '#d4d4d8', fontSize: 14, fontWeight: '500' }}>Liên hệ hỗ trợ</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: '#27272a', marginHorizontal: 16, marginVertical: 4 }} />

              {/* Logout */}
              <TouchableOpacity
                onPress={() => { setMenuOpen(false); void logout(); }}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}
              >
                <LogOut size={16} color="#ef4444" strokeWidth={1.75} />
                <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '600' }}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    top: 72,
    right: 16,
    width: 260,
    backgroundColor: '#18181b',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    zIndex: 200,
    // web shadow
    // @ts-ignore
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    elevation: 12,
    overflow: 'hidden',
  },
});
