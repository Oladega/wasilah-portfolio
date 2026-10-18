"use client";
import { useEffect, useState } from "react";
import { siteConfig } from "@/data/site";
interface ClockState {
  time: string;
  date: string;
  zone: string;
}
export function LocalClock({
  date = false,
  zone = false,
}: {
  date?: boolean;
  zone?: boolean;
}) {
  const [clock, setClock] = useState<ClockState | null>(null);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const timeZone =
        siteConfig.timezone === "auto" ? undefined : siteConfig.timezone;
      const resolvedZone =
        timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      const city =
        siteConfig.location === "auto"
          ? !resolvedZone || /^(Etc|UTC|GMT)/.test(resolvedZone)
            ? "Local"
            : resolvedZone.split("/").pop()!.replaceAll("_", " ")
          : siteConfig.location;
      const offset = (
        new Intl.DateTimeFormat("en-US", {
          timeZone,
          timeZoneName: "shortOffset",
        })
          .formatToParts(now)
          .find((part) => part.type === "timeZoneName")?.value ?? "GMT"
      ).replace("GMT", "UTC");
      const next = {
        time: now.toLocaleTimeString("en-GB", {
          timeZone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        date: now
          .toLocaleDateString("en-GB", {
            timeZone,
            weekday: "short",
            day: "numeric",
            month: "short",
          })
          .replace(",", ""),
        zone: `${city} · ${offset}`.toUpperCase(),
      };
      setClock((old) =>
        old?.time === next.time &&
        old?.date === next.date &&
        old?.zone === next.zone
          ? old
          : next,
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);
  if (zone) return <span>{clock?.zone ?? "LOCAL · UTC"}</span>;
  return (
    <time suppressHydrationWarning>
      {date && (
        <span className="clock-date">{clock?.date ?? "\u00a0"}&nbsp; </span>
      )}
      {clock?.time ?? "--:--"}
    </time>
  );
}
