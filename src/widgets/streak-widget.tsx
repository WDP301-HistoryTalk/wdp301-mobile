'use no memo';

import { FlexWidget, TextWidget } from 'react-native-android-widget';

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

const CARD_BG = '#F7F1EA';
const TEXT = '#322D29';
const MUTED = '#5F554E';
const ORANGE = '#72383D';
const STREAK_GREEN = '#16A34A';
const TRACK_BG = 'rgba(114, 56, 61, 0.14)';
const TINT_BG = 'rgba(114, 56, 61, 0.08)';

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function WeekRow({ week }: { week: StreakWidgetWeekDay[] }) {
  return (
    <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', width: 'match_parent' }}>
      {week.map((d, i) => (
        <FlexWidget key={i} style={{ flexDirection: 'column', alignItems: 'center' }}>
          <FlexWidget
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: d.studied ? STREAK_GREEN : d.isToday ? TRACK_BG : 'rgba(50, 45, 41, 0.06)',
            }}
          >
            {d.studied ? <TextWidget text="✓" style={{ fontSize: 10, fontWeight: 'bold', color: '#ffffff' }} /> : null}
          </FlexWidget>
          <TextWidget
            text={WEEKDAY_LABELS[i] ?? ''}
            style={{ fontSize: 8, fontWeight: 'bold', color: d.studied ? STREAK_GREEN : MUTED, marginTop: 3 }}
          />
        </FlexWidget>
      ))}
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
        height: 6,
        borderRadius: 3,
        backgroundColor: TRACK_BG,
        overflow: 'hidden',
      }}
    >
      {filled > 0 ? (
        <FlexWidget style={{ flex: filled, height: 'match_parent', backgroundColor: ORANGE, borderRadius: 3 }} />
      ) : null}
      <FlexWidget style={{ flex: remaining, height: 'match_parent' }} />
    </FlexWidget>
  );
}

// Widget man hinh chinh Android: chuoi ngay hoc + tien do nhiem vu hom nay +
// 1 nhan vat ngau nhien. Chi dung Flex/TextWidget (khong Image) de tranh phai
// bundle font/icon rieng cho widget.
export function StreakWidget({ streakCount, questsCompleted, questsTotal, week, character }: StreakWidgetProps) {
  const hasQuests = questsTotal > 0;

  return (
    <FlexWidget
      clickAction={character ? undefined : 'OPEN_APP'}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 14,
      }}
    >
      <FlexWidget
        clickAction="OPEN_APP"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
        }}
      >
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextWidget text="🔥" style={{ fontSize: 18, marginRight: 4 }} />
          <TextWidget text={`${streakCount} ngày`} style={{ fontSize: 16, fontWeight: 'bold', color: TEXT }} />
        </FlexWidget>

        {hasQuests ? (
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextWidget text="🎯" style={{ fontSize: 14, marginRight: 4 }} />
            <TextWidget
              text={`${questsCompleted}/${questsTotal} nhiệm vụ`}
              style={{ fontSize: 12, fontWeight: 'bold', color: ORANGE }}
            />
          </FlexWidget>
        ) : null}
      </FlexWidget>

      {hasQuests ? (
        <FlexWidget style={{ width: 'match_parent', marginTop: 8, marginBottom: 10 }}>
          <ProgressBar completed={questsCompleted} total={questsTotal} />
        </FlexWidget>
      ) : (
        <TextWidget
          text="chuỗi học liên tiếp"
          style={{ fontSize: 12, color: MUTED, marginTop: 2, marginBottom: 10 }}
        />
      )}

      {week.length > 0 ? (
        <FlexWidget style={{ width: 'match_parent', marginBottom: 10 }}>
          <WeekRow week={week} />
        </FlexWidget>
      ) : null}

      {character ? (
        <FlexWidget
          clickAction="OPEN_URI"
          clickActionData={{ uri: `mobilehistorytalk://characters/${character.id}` }}
          style={{
            flexDirection: 'column',
            width: 'match_parent',
            backgroundColor: TINT_BG,
            borderRadius: 14,
            padding: 10,
          }}
        >
          <TextWidget
            text={character.name}
            style={{ fontSize: 13, fontWeight: 'bold', color: ORANGE }}
            truncate="END"
            maxLines={1}
          />
          {character.title ? (
            <TextWidget
              text={character.title}
              style={{ fontSize: 11, color: MUTED, marginTop: 2 }}
              truncate="END"
              maxLines={1}
            />
          ) : null}
        </FlexWidget>
      ) : null}
    </FlexWidget>
  );
}
