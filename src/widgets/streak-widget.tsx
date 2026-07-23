import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface StreakWidgetCharacter {
  id: string;
  name: string;
  title?: string;
}

export interface StreakWidgetProps {
  streakCount: number;
  character: StreakWidgetCharacter | null;
}

// Widget man hinh chinh Android: chuoi ngay hoc + 1 nhan vat/cau noi ngau
// nhien. Chi dung Flex/TextWidget (khong Image) de tranh phai bundle font/
// icon rieng cho widget — giu it rui ro nhat co the cho lan dau lam widget.
export function StreakWidget({ streakCount, character }: StreakWidgetProps) {
  return (
    <FlexWidget
      clickAction={character ? undefined : 'OPEN_APP'}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: '#F2E8D5',
        borderRadius: 20,
        padding: 16,
      }}
    >
      <FlexWidget
        clickAction="OPEN_APP"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <TextWidget text="🔥" style={{ fontSize: 22, marginRight: 6 }} />
        <TextWidget
          text={`${streakCount} ngày`}
          style={{ fontSize: 20, fontWeight: 'bold', color: '#2B2118' }}
        />
      </FlexWidget>

      <TextWidget
        text="chuỗi học liên tiếp"
        style={{ fontSize: 12, color: '#7A6E60', marginTop: 2, marginBottom: 10 }}
      />

      {character ? (
        <FlexWidget
          clickAction="OPEN_URI"
          clickActionData={{ uri: `mobilehistorytalk://characters/${character.id}` }}
          style={{
            flexDirection: 'column',
            width: 'match_parent',
            backgroundColor: 'rgba(114, 56, 61, 0.08)',
            borderRadius: 14,
            padding: 10,
          }}
        >
          <TextWidget
            text={character.name}
            style={{ fontSize: 14, fontWeight: 'bold', color: '#72383D' }}
            truncate="END"
            maxLines={1}
          />
          {character.title ? (
            <TextWidget
              text={character.title}
              style={{ fontSize: 12, color: '#7A6E60', marginTop: 2 }}
              truncate="END"
              maxLines={1}
            />
          ) : null}
        </FlexWidget>
      ) : null}
    </FlexWidget>
  );
}
