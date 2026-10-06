import { useEffect, useMemo, useState } from "react";

export const FOCUS_BLOCK_MINUTES = 50;
export const SHORT_BREAK_MINUTES = 10;
export const LONG_BREAK_MINUTES = 15;
export const BLOCKS_BEFORE_LONG_BREAK = 4;

export async function requestTimerNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      // Notifications are optional; the timer still works without them.
    }
  }
}

export function notifyTimer(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

export function startStudyTimer(session) {
  return {
    sessionId: session.id,
    topic: session.topic,
    totalSeconds: Math.max(1, Number(session.durationMinutes) || 1) * 60,
  };
}

export function formatTimer(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function useCountdown(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return undefined;

    const interval = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running]);

  return useMemo(
    () => ({
      seconds,
      running,
      setSeconds,
      setRunning,
      toggle: () => setRunning((value) => !value),
    }),
    [seconds, running]
  );
}


export default function StudyTimer() {
  const timer = useCountdown(FOCUS_BLOCK_MINUTES * 60);

  useEffect(() => {
    if (timer.seconds !== 0 || timer.running) return;
    notifyTimer("StudySync timer", "Study block completed. Take a short break.");
  }, [timer.seconds, timer.running]);

  const reset = () => {
    timer.setRunning(false);
    timer.setSeconds(FOCUS_BLOCK_MINUTES * 60);
  };

  return (
    <aside
      aria-label="Study timer"
      style={{
        position: "fixed",
        right: "1rem",
        bottom: "1rem",
        zIndex: 1000,
        padding: "0.75rem 1rem",
        borderRadius: "12px",
        background: "var(--card-bg, #ffffff)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
      }}
    >
      <strong>{formatTimer(timer.seconds)}</strong>
      <button type="button" onClick={timer.toggle}>
        {timer.running ? "Pause" : "Start"}
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
    </aside>
  );
}
