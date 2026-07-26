import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const END_CALL_SOUND = require('../../assets/audios/end-call.mp3');

let audioModeReady = false;

/** Phát âm thanh kết thúc cuộc gọi voice (bấm nút cúp máy trong chat-screen). */
export async function playEndCallSound(): Promise<void> {
  if (!audioModeReady) {
    await setAudioModeAsync({ playsInSilentMode: true });
    audioModeReady = true;
  }

  const player = createAudioPlayer(END_CALL_SOUND);
  player.addListener('playbackStatusUpdate', (status) => {
    if (status.didJustFinish) player.remove();
  });
  player.play();
}
