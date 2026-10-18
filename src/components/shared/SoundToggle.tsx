"use client";
import { useEffect, useSyncExternalStore } from "react";
import { Icon } from "./Icon";
import {
  subscribeAudio,
  getAudioState,
  getServerAudioState,
  toggleAudio,
  prepareAudio,
} from "@/lib/audio";
export function SoundToggle() {
  useEffect(() => { prepareAudio(); }, []);
  const playing = useSyncExternalStore(
    subscribeAudio,
    getAudioState,
    getServerAudioState,
  );
  return (
    <button
      className="sound-toggle"
      aria-label={playing ? "Mute background music" : "Play background music"}
      title="Jazzy Amapiano Bounce — BudgetPixel AI · CC BY 4.0"
      aria-pressed={playing}
      onClick={toggleAudio}
    >
      <Icon name={playing ? "sound" : "speaker"} size={18} />
      {playing && (
        <span className="equalizer" aria-hidden="true">
          ▂▆▃
        </span>
      )}
    </button>
  );
}
