'use client';

import { useSyncExternalStore } from 'react';

interface InfoBarProps {
  title: string;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('es-ES', {
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
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white py-4">
      <h1 className="text-lg font-normal text-gray-500">{title}</h1>
      <div className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm text-gray-600">
        {currentTime ? formatDateTime(currentTime) : ''}
      </div>
    </div>
  );
}
