import { siteConfig } from "@/data/site";
let audio: HTMLAudioElement | null = null;
let playing = false;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();
export const getAudioState = () => playing;
export const getServerAudioState = () => false;
export function subscribeAudio(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export async function toggleAudio() {
  audio ??= new Audio(siteConfig.audio);
  audio.loop = true;
  if (timer) clearInterval(timer);
  const next = !playing;
  if (next) {
    audio.volume = 0;
    try {
      await audio.play();
    } catch {
      return;
    }
  }
  playing = next;
  listeners.forEach((listener) => listener());
  const initial = audio.volume;
  let frame = 0;
  timer = setInterval(() => {
    if (!audio) return;
    frame++;
    audio.volume = Math.max(
      0,
      Math.min(1, initial + (((next ? 0.35 : 0) - initial) * frame) / 20),
    );
    if (frame >= 20) {
      clearInterval(timer);
      if (!next) audio.pause();
    }
  }, 40);
}
