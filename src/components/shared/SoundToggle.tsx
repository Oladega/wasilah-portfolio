"use client";
import { useSyncExternalStore } from "react";
import { Icon } from "./Icon";
import {
  subscribeAudio,
  getAudioState,
  getServerAudioState,
  toggleAudio,
} from "@/lib/audio";
export function SoundToggle() {
  const playing = useSyncExternalStore(
    subscribeAudio,
    getAudioState,
    getServerAudioState,
  );
  return (
    <button
      className="sound-toggle"
      aria-label={playing ? "Mute background music" : "Play background music"}
      title="Solo piano · Gymnopédie No. 1 — Erik Satie; Robin Alciatore / Musopen"
      aria-pressed={playing}
      onClick={toggleAudio}
    >
      <Icon name={playing ? "sound" : "speaker"} size={14} />
      {playing && (
        <span className="equalizer" aria-hidden="true">
          ▂▆▃
        </span>
      )}
    </button>
  );
}
