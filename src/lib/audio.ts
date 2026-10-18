import { siteConfig } from "@/data/site";
let audio: HTMLAudioElement | null = null;
let playing = false;
let pendingPlay: Promise<void> | null = null;
const listeners = new Set<() => void>();
export const getAudioState = () => playing;
export const getServerAudioState = () => false;
export function subscribeAudio(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function prepareAudio() {
  if (!audio) {
    audio = new Audio(siteConfig.audio);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = 0.35;
    audio.load();
  }
  return audio;
}
function notify() { listeners.forEach(listener => listener()); }
export async function toggleAudio() {
  const player = prepareAudio();
  if (playing || pendingPlay) {
    pendingPlay = null;
    player.pause();
    playing = false;
    notify();
    return;
  }
  // Start at the listening volume immediately, within the user's tap gesture.
  player.volume = 0.35;
  const request = player.play();
  pendingPlay = request;
  try {
    await request;
    if (pendingPlay !== request) return;
    pendingPlay = null;
    playing = true;
    notify();
  } catch {
    if (pendingPlay !== request) return;
    pendingPlay = null;
    playing = false;
    notify();
  }
}
