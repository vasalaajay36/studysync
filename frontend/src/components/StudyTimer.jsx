import { useEffect, useMemo, useState } from "react";
import "./StudyTimer.css";

const TIMER_KEY = "studysync.activeTimer";
const CHANNEL_NAME = "studysync-timer";

function readTimer() {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function broadcast(timer) {
  localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
  window.dispatchEvent(new CustomEvent("studysync-timer-change", { detail: timer }));
  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(timer);
    channel.close();
  }
}

export async function requestTimerNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    return (await Notification.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

export function startStudyTimer(session) {
  const timer = {
    status: "running",
    sessionId: session.id,
    topic: session.topic,
    description: session.description || "",
    studyDate: session.studyDate || session.date,
    durationMinutes: Number(session.durationMinutes),
    startedAt: Date.now(),
    endAt: Date.now() + Number(session.durationMinutes) * 60 * 1000,
    remainingMs: Number(session.durationMinutes) * 60 * 1000,
  };

  broadcast(timer);
  return timer;
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

async function markSessionCompleted(timer) {
  if (!timer?.sessionId) return;

  try {
    const response = await fetch(`/api/study-sessions/${timer.sessionId}`);
    if (!response.ok) return;

    const session = await response.json();
    await fetch(`/api/study-sessions/${timer.sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: session.topic,
        description: session.description,
        studyDate: session.studyDate,
        durationMinutes: session.durationMinutes,
        completed: true,
        studentId: session.studentId,
      }),
    });
  } catch (error) {
    console.error("Unable to mark study session completed:", error);
  }
}

function showTimerNotification(timer, remainingMs, completed = false) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const body = completed
    ? `"${timer.topic}" session is complete.`
    : `"${timer.topic}" — ${formatTime(remainingMs)} remaining.`;

  try {
    new Notification(completed ? "StudySync — Session Complete" : "StudySync — Study Timer", {
      body,
      tag: "studysync-study-timer",
      icon: "/favicon.ico",
    });
  } catch {
    // Browser notification support can fail silently in some environments.
  }
}

async function openFloatingTimer() {
  const pip = window.documentPictureInPicture;

  if (!pip) {
    alert("Floating timer is not supported by this browser. Enable notifications instead.");
    return;
  }

  if (pip.window) {
    pip.window.focus();
    return;
  }

  const timerWindow = await pip.requestWindow({
    width: 330,
    height: 190,
  });

  const style = timerWindow.document.createElement("style");
  style.textContent = `
    body {
      margin: 0;
      padding: 18px;
      background: #121d40;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .label { font-size: 10px; letter-spacing: 1.2px; color: #aeb7d8; font-weight: 700; }
    .topic { display: block; margin-top: 5px; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .time { margin: 15px 0 10px; font-size: 34px; font-weight: 800; font-variant-numeric: tabular-nums; }
    .progress { height: 6px; background: #2d385d; border-radius: 99px; overflow: hidden; }
    .progress span { display: block; height: 100%; background: #7357f5; }
    .actions { display: flex; gap: 8px; margin-top: 13px; }
    button { flex: 1; border: 0; border-radius: 8px; padding: 8px; font-weight: 700; cursor: pointer; }
  `;
  timerWindow.document.head.appendChild(style);

  const root = timerWindow.document.createElement("div");
  root.innerHTML = `
    <span class="label">STUDYSYNC FOCUS TIMER</span>
    <span class="topic"></span>
    <div class="time">00:00</div>
    <div class="progress"><span></span></div>
    <div class="actions">
      <button class="pause">Pause</button>
      <button class="stop">Stop</button>
    </div>
  `;
  timerWindow.document.body.appendChild(root);

  const channel = "BroadcastChannel" in window
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

  const render = () => {
    const current = readTimer();
    if (!current) {
      timerWindow.close();
      return;
    }

    const remaining = current.status === "paused"
      ? Number(current.remainingMs || 0)
      : Math.max(0, Number(current.endAt) - Date.now());

    root.querySelector(".topic").textContent = current.topic;
    root.querySelector(".time").textContent = formatTime(remaining);
    root.querySelector(".progress span").style.width =
      `${Math.max(0, Math.min(100, remaining / (Number(current.durationMinutes) * 60 * 1000) * 100))}%`;
    root.querySelector(".pause").textContent =
      current.status === "paused" ? "Resume" : "Pause";

    if (remaining <= 0) {
      timerWindow.close();
    }
  };

  const interval = timerWindow.setInterval(render, 250);
  render();

  root.querySelector(".pause").onclick = () => {
    const current = readTimer();
    if (!current) return;

    const next = current.status === "paused"
      ? { ...current, status: "running", endAt: Date.now() + Number(current.remainingMs) }
      : { ...current, status: "paused", remainingMs: Math.max(0, Number(current.endAt) - Date.now()) };

    broadcast(next);
    render();
  };

  root.querySelector(".stop").onclick = () => {
    broadcast(null);
    timerWindow.close();
  };

  channel?.addEventListener("message", render);
  timerWindow.addEventListener("pagehide", () => {
    timerWindow.clearInterval(interval);
    channel?.close();
  });
}

function StudyTimer() {
  const [timer, setTimer] = useState(readTimer);
  const [now, setNow] = useState(Date.now());
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  useEffect(() => {
    const sync = (nextTimer) => setTimer(nextTimer);

    const storageHandler = (event) => {
      if (event.key === TIMER_KEY) {
        setTimer(readTimer());
      }
    };

    const customHandler = (event) => sync(event.detail || readTimer());
    window.addEventListener("storage", storageHandler);
    window.addEventListener("studysync-timer-change", customHandler);

    let channel;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => sync(event.data);
    }

    return () => {
      window.removeEventListener("storage", storageHandler);
      window.removeEventListener("studysync-timer-change", customHandler);
      channel?.close();
    };
  }, []);

  useEffect(() => {
    if (!timer || timer.status !== "running") return undefined;

    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [timer]);

  const remainingMs = useMemo(() => {
    if (!timer) return 0;
    if (timer.status === "paused") return Number(timer.remainingMs || 0);
    return Math.max(0, Number(timer.endAt) - now);
  }, [timer, now]);

  useEffect(() => {
    if (!timer || timer.status !== "running" || remainingMs > 0) return;

    const completedTimer = { ...timer, status: "completed", remainingMs: 0 };
    broadcast(null);
    markSessionCompleted(timer);
    showTimerNotification(timer, 0, true);
    setTimer(completedTimer);
  }, [remainingMs, timer]);

  useEffect(() => {
    if (!timer || timer.status !== "running") return undefined;

    const notify = () => {
      if (document.hidden) {
        const current = Math.max(0, Number(timer.endAt) - Date.now());
        if (current > 0) showTimerNotification(timer, current);
      }
    };

    const interval = window.setInterval(notify, 60_000);
    const visibilityHandler = () => {
      if (document.hidden) notify();
    };

    document.addEventListener("visibilitychange", visibilityHandler);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", visibilityHandler);
    };
  }, [timer]);

  const pauseTimer = () => {
    if (!timer || timer.status !== "running") return;
    const paused = {
      ...timer,
      status: "paused",
      remainingMs: Math.max(0, Number(timer.endAt) - Date.now()),
    };
    broadcast(paused);
    setTimer(paused);
  };

  const resumeTimer = async () => {
    if (!timer || timer.status !== "paused") return;
    const resumed = {
      ...timer,
      status: "running",
      endAt: Date.now() + Number(timer.remainingMs),
    };
    await requestTimerNotificationPermission();
    broadcast(resumed);
    setTimer(resumed);
  };

  const stopTimer = () => {
    if (!timer) return;
    broadcast(null);
    setTimer(null);
  };

  const enableNotifications = async () => {
    const granted = await requestTimerNotificationPermission();
    setPermission(granted ? "granted" : Notification.permission);
  };

  if (!timer || timer.status === "completed") return null;

  const progress = timer.durationMinutes
    ? Math.max(0, Math.min(100, (remainingMs / (timer.durationMinutes * 60 * 1000)) * 100))
    : 0;

  return (
    <div className="study-timer-widget" role="status" aria-live="polite">
      <div className="study-timer-header">
        <div>
          <span className="study-timer-label">FOCUS TIMER</span>
          <strong>{timer.topic}</strong>
        </div>
        <span className={timer.status === "paused" ? "timer-state paused" : "timer-state"}>
          {timer.status === "paused" ? "Paused" : "Live"}
        </span>
      </div>

      <div className="study-timer-time">{formatTime(remainingMs)}</div>

      <div className="study-timer-progress">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="study-timer-actions">
        <button onClick={openFloatingTimer}>Pop out</button>
        {timer.status === "running" ? (
          <button onClick={pauseTimer}>Pause</button>
        ) : (
          <button onClick={resumeTimer}>Resume</button>
        )}
        <button className="timer-stop" onClick={stopTimer}>Stop</button>
      </div>

      {permission !== "granted" && permission !== "unsupported" && (
        <button className="timer-notification-button" onClick={enableNotifications}>
          Enable popup notifications
        </button>
      )}

      {permission === "granted" && (
        <small>You'll get time updates when you work in another tab.</small>
      )}
    </div>
  );
}

export default StudyTimer;
