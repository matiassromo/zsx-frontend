'use client';

import { useSyncExternalStore } from 'react';

interface InfoBarProps {
  title: string;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

let currentTimeKey = new Date().toISOString();
let intervalId: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function updateTime() {
  currentTimeKey = new Date().toISOString();
  notifyListeners();
}

function subscribeToTime(callback: () => void) {
  listeners.add(callback);
  if (!intervalId) {
    intervalId = setInterval(updateTime, 60000);
  }
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getTimeSnapshot() {
  return currentTimeKey;
}

function getServerSnapshot() {
  return currentTimeKey;
}

export default function InfoBar({ title }: InfoBarProps) {
  const timeKey = useSyncExternalStore(subscribeToTime, getTimeSnapshot, getServerSnapshot);
  const currentTime = timeKey ? new Date(timeKey) : null;

  return (
    <div className="sticky top-0 z-30 -mx-4 md:-mx-6 mb-5 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3">
      <h1 className="text-xs font-semibold tracking-[0.1em] uppercase text-slate-500">
        {title}
      </h1>
      {currentTime && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatDateTime(currentTime)}</span>
        </div>
      )}
    </div>
  );
}
