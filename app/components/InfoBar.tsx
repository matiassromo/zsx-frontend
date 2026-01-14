"use client";

import { useState, useEffect } from "react";

interface InfoBarProps {
  title: string;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function InfoBar({ title }: InfoBarProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white py-4">
      <h1 className="text-lg font-normal text-gray-500">{title}</h1>
      <div className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm text-gray-600">
        {currentTime ? formatDateTime(currentTime) : ""}
      </div>
    </div>
  );
}
