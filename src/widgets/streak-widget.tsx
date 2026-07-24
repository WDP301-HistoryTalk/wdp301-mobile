'use no memo';

import { FlexWidget, ImageWidget, OverlapWidget, SvgWidget, TextWidget, type ColorProp } from 'react-native-android-widget';

export interface StreakWidgetCharacter {
  id: string;
  name: string;
  title?: string;
}

export interface StreakWidgetWeekDay {
  studied: boolean;
  isToday: boolean;
}

export interface StreakWidgetProps {
  streakCount: number;
  questsCompleted: number;
  questsTotal: number;
  /** 7 phan tu, thu tu Thu 2 -> Chu nhat (giong GamificationToday.week). */
  week: StreakWidgetWeekDay[];
  character: StreakWidgetCharacter | null;
}

// ---------------------------------------------------------------------------
// Light-theme palette — giu thiet ke moi nhung dung gam mau sang am cua HistoryTalk.
// ---------------------------------------------------------------------------
const BG = '#F7F1EA';           // warm light background
const TEXT_PRIMARY = '#322D29'; // dark brown text
const TEXT_MUTED = '#7A7067';   // medium brown muted text
const ACCENT = '#72383D';       // brand reddish orange
const GREEN_DONE = '#4A8C62';   // brand green for completed days
const RED_MISS = '#9A3F43';     // brand red for missed days
const BLUE_TODAY = '#3B82F6';   // active blue ring for today
const GREY_RING = '#D6D3D1';    // subtle ring for upcoming days
const TRACK_BG = 'rgba(114, 56, 61, 0.14)';
const CHIP_BG = 'rgba(50, 45, 41, 0.05)';
const CHAR_BG = 'rgba(114, 56, 61, 0.08)';

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DOT_SIZE = 28;

type DayState = 'done' | 'today' | 'missed' | 'upcoming';

function getDayState(d: StreakWidgetWeekDay, index: number, todayIndex: number): DayState {
  if (d.studied) return 'done';
  if (d.isToday) return 'today';
  // Khong xac dinh duoc hom nay trong tuan (du lieu bat thuong) — coi nhu
  // chua toi, tranh gan nham "bo lo" cho ngay chua chac chan.
  if (todayIndex === -1) return 'upcoming';
  return index < todayIndex ? 'missed' : 'upcoming';
}

// ---------------------------------------------------------------------------
// SVG helpers — ve hinh tron bang SVG string (qua androidsvg tren native side)
// cho net sac, khong bi vuong goc nhu FlexWidget borderRadius tren RemoteViews.
// ---------------------------------------------------------------------------
function circleSvg({ fill, stroke, strokeWidth }: { fill: string; stroke?: string; strokeWidth?: number }): string {
  const sw = strokeWidth ?? 0;
  const r = 11 - sw / 2;
  const strokeAttr = stroke ? `stroke="${stroke}" stroke-width="${sw}"` : 'stroke="none"';
  return `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="${r}" fill="${fill}" ${strokeAttr}/></svg>`;
}

function dotSvg(state: DayState, isToday: boolean): string {
  if (state === 'done' && isToday) {
    // Hom nay da hoc xong — green fill + blue vien ngoai de phan biet
    return `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="11" fill="${GREEN_DONE}"/><circle cx="14" cy="14" r="13" fill="none" stroke="${BLUE_TODAY}" stroke-width="1.5"/></svg>`;
  }
  switch (state) {
    case 'done':
      return circleSvg({ fill: GREEN_DONE });
    case 'today':
      return circleSvg({ fill: 'rgba(59, 130, 246, 0.12)', stroke: BLUE_TODAY, strokeWidth: 2.5 });
    case 'missed':
      return circleSvg({ fill: 'rgba(154, 63, 67, 0.10)', stroke: RED_MISS, strokeWidth: 1.5 });
    case 'upcoming':
    default:
      return circleSvg({ fill: 'none', stroke: GREY_RING, strokeWidth: 1.5 });
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DayDot({ state, isToday }: { state: DayState; isToday: boolean }) {
  return (
    <OverlapWidget style={{ width: DOT_SIZE, height: DOT_SIZE }}>
      <SvgWidget svg={dotSvg(state, isToday)} style={{ width: DOT_SIZE, height: DOT_SIZE }} />
      <FlexWidget style={{ width: DOT_SIZE, height: DOT_SIZE, alignItems: 'center', justifyContent: 'center' }}>
        {state === 'done' ? (
          <TextWidget text="✓" style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff' }} />
        ) : state === 'missed' ? (
          <TextWidget text="!" style={{ fontSize: 13, fontWeight: 'bold', color: RED_MISS }} />
        ) : null}
      </FlexWidget>
    </OverlapWidget>
  );
}

function WeekRow({ week }: { week: StreakWidgetWeekDay[] }) {
  const todayIndex = week.findIndex((d) => d.isToday);

  return (
    <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', width: 'match_parent' }}>
      {week.map((d, i) => {
        const state = getDayState(d, i, todayIndex);
        const labelColor =
          state === 'done'
            ? GREEN_DONE
            : state === 'today'
              ? BLUE_TODAY
              : state === 'missed'
                ? RED_MISS
                : TEXT_MUTED;
        return (
          <FlexWidget key={i} style={{ flexDirection: 'column', alignItems: 'center' }}>
            <DayDot state={state} isToday={d.isToday} />
            <TextWidget
              text={WEEKDAY_LABELS[i] ?? ''}
              style={{ fontSize: 9, fontWeight: 'bold', color: labelColor, marginTop: 4 }}
            />
            {/* Gach ngan mau xanh ben duoi ngay hom nay — giong ref Duolingo */}
            {d.isToday ? (
              <FlexWidget
                style={{ width: 14, height: 2, backgroundColor: BLUE_TODAY, borderRadius: 1, marginTop: 3 }}
              />
            ) : (
              <FlexWidget style={{ width: 14, height: 2, marginTop: 3 }} />
            )}
          </FlexWidget>
        );
      })}
    </FlexWidget>
  );
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  // FlexWidget "flex" chia theo ti le — dung so nguyen lam trong so, dam bao
  // luon > 0 de tranh crash khi chua co quest nao hoac total = 0.
  const filled = Math.max(completed, 0);
  const remaining = Math.max(total - completed, 0.001);

  return (
    <FlexWidget
      style={{
        flexDirection: 'row',
        width: 'match_parent',
        height: 5,
        borderRadius: 3,
        backgroundColor: TRACK_BG,
        overflow: 'hidden',
      }}
    >
      {filled > 0 ? (
        <FlexWidget style={{ flex: filled, height: 'match_parent', backgroundColor: ACCENT, borderRadius: 3 }} />
      ) : null}
      <FlexWidget style={{ flex: remaining, height: 'match_parent' }} />
    </FlexWidget>
  );
}

// Chip nen tron cho 1 chi so o header (icon + text), giong cach Duolingo hien
// "1/2"/"2/3" — dark glass style.
function StatChip({ icon, text, color }: { icon: string; text: string; color: ColorProp }) {
  return (
    <FlexWidget
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CHIP_BG,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
      }}
    >
      <TextWidget text={icon} style={{ fontSize: 11, marginRight: 4 }} />
      <TextWidget text={text} style={{ fontSize: 11, fontWeight: 'bold', color }} />
    </FlexWidget>
  );
}

// ---------------------------------------------------------------------------
// Main widget — dark theme, prominent streak, Duolingo-style week dots
// ---------------------------------------------------------------------------
export function StreakWidget({ streakCount, questsCompleted, questsTotal, week, character }: StreakWidgetProps) {
  const hasQuests = questsTotal > 0;

  // Hinh cat uon luon mem mai o goc duoi ben phai de tao diem nhan cho nen (khong bi trong)
  const bgDecorationSvg = `
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 150 C 40 110, 90 70, 150 40 L 150 150 Z" fill="#EFE8DF" />
    </svg>
  `;

  return (
    <OverlapWidget style={{ height: 'match_parent', width: 'match_parent' }}>
      {/* 1. Base Background */}
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: BG,
          borderRadius: 20,
        }}
      />

      {/* 2. Background Decoration Layer (subtle paper curve) */}
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
        }}
      >
        <SvgWidget svg={bgDecorationSvg} style={{ width: 150, height: 150 }} />
      </FlexWidget>

      {/* 3. Main Content Layer */}
      <FlexWidget
        clickAction="OPEN_APP"
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 14,
        }}
      >
        {/* ── Header: fire + streak count | quest stats ── */}
        <FlexWidget
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: 'match_parent',
          }}
        >
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextWidget text="🔥" style={{ fontSize: 20, marginRight: 4 }} />
            <TextWidget
              text={`${streakCount}`}
              style={{ fontSize: 22, fontWeight: 'bold', color: TEXT_PRIMARY }}
            />
            <TextWidget
              text=" ngày"
              style={{ fontSize: 12, fontWeight: 'bold', color: TEXT_MUTED, marginLeft: 2 }}
            />
          </FlexWidget>

          {hasQuests ? (
            <StatChip icon="🎯" text={`${questsCompleted}/${questsTotal}`} color={ACCENT} />
          ) : null}
        </FlexWidget>

        {/* ── Progress bar (chi hien khi co quest) hoac subtitle ── */}
        {hasQuests ? (
          <FlexWidget style={{ width: 'match_parent', marginTop: 10, marginBottom: 10 }}>
            <ProgressBar completed={questsCompleted} total={questsTotal} />
          </FlexWidget>
        ) : (
          <TextWidget
            text="chuỗi học liên tiếp"
            style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4, marginBottom: 10 }}
          />
        )}

        {/* ── Week row voi day dots + today indicator ── */}
        {week.length > 0 ? (
          <FlexWidget style={{ width: 'match_parent', marginBottom: 10 }}>
            <WeekRow week={week} />
          </FlexWidget>
        ) : null}

        {/* ── Character chip ── */}
        {character ? (
          <FlexWidget
            clickAction="OPEN_URI"
            clickActionData={{ uri: `mobilehistorytalk://characters/${character.id}` }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: 'match_parent',
              backgroundColor: CHAR_BG,
              borderRadius: 14,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <ImageWidget
              image={require('../../assets/logo.png')}
              imageWidth={18}
              imageHeight={18}
              radius={9}
              style={{ marginRight: 8 }}
            />
            <FlexWidget style={{ flexDirection: 'column', flex: 1 }}>
              <TextWidget
                text={character.name}
                style={{ fontSize: 12, fontWeight: 'bold', color: ACCENT }}
                truncate="END"
                maxLines={1}
              />
              {character.title ? (
                <TextWidget
                  text={character.title}
                  style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 1 }}
                  truncate="END"
                  maxLines={1}
                />
              ) : null}
            </FlexWidget>
            <TextWidget text="›" style={{ fontSize: 18, color: TEXT_MUTED, marginLeft: 4 }} />
          </FlexWidget>
        ) : null}
      </FlexWidget>
    </OverlapWidget>
  );
}
