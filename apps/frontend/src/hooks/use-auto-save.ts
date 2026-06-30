"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave(token: string, step: number, delay = 2000) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDataRef = useRef<Record<string, unknown> | null>(null);

  const save = useCallback(
    async (data: Record<string, unknown>) => {
      setStatus("saving");
      try {
        await api.patch(`/api/briefing/${token}/step/${step}`, { data });
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("error");
      }
    },
    [token, step]
  );

  const schedule = useCallback(
    (data: Record<string, unknown>) => {
      pendingDataRef.current = data;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (pendingDataRef.current) {
          save(pendingDataRef.current);
          pendingDataRef.current = null;
        }
      }, delay);
    },
    [save, delay]
  );

  const retry = useCallback(() => {
    if (pendingDataRef.current) {
      save(pendingDataRef.current);
    }
  }, [save]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { status, schedule, retry };
}
