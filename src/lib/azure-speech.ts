import { File, Paths } from 'expo-file-system';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const AZURE_SPEECH_KEY = process.env.EXPO_PUBLIC_AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.EXPO_PUBLIC_AZURE_SPEECH_REGION;
const AZURE_SPEECH_VOICE = process.env.EXPO_PUBLIC_AZURE_SPEECH_VOICE ?? 'vi-VN-NamMinhNeural';

let currentPlayer: AudioPlayer | null = null;
let audioModeReady = false;

function escapeSsml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    throw new Error('Chưa cấu hình Azure Speech (thiếu key hoặc region).');
  }

  const ssml = `<speak version="1.0" xml:lang="vi-VN"><voice name="${AZURE_SPEECH_VOICE}">${escapeSsml(text)}</voice></speak>`;

  const res = await fetch(
    `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'HistoryTalkMobile',
      },
      body: ssml,
    },
  );

  if (!res.ok) {
    throw new Error(`Azure Speech loi ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  return res.arrayBuffer();
}

/** Đọc to một đoạn text bằng giọng Azure. Trả về player để theo dõi trạng thái phát. */
export async function speakWithAzure(text: string): Promise<AudioPlayer> {
  stopAzureSpeech();

  if (!audioModeReady) {
    await setAudioModeAsync({ playsInSilentMode: true });
    audioModeReady = true;
  }

  const buffer = await synthesizeSpeech(text);
  const file = new File(Paths.cache, `tts-${Date.now()}.mp3`);
  file.create();
  file.write(new Uint8Array(buffer));

  const player = createAudioPlayer(file.uri);
  currentPlayer = player;
  player.play();
  return player;
}

export function stopAzureSpeech(): void {
  if (!currentPlayer) return;
  try {
    currentPlayer.pause();
    currentPlayer.remove();
  } catch {
    // player đã bị giải phóng
  }
  currentPlayer = null;
}
