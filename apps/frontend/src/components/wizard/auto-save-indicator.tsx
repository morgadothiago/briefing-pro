"use client";

import { Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  onRetry?: () => void;
}

export function AutoSaveIndicator({ status, onRetry }: AutoSaveIndicatorProps) {
  if (status === "idle") return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full",
        status === "saving" && "text-gray-400",
        status === "saved" && "text-emerald-500",
        status === "error" && "text-red-400"
      )}
    >
      {status === "saving" && (
        <>
          <Loader2 size={12} className="animate-spin" />
          Salvando...
        </>
      )}
      {status === "saved" && (
        <>
          <Check size={12} />
          Salvo
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle size={12} />
          Falha ao salvar
          {onRetry && (
            <button
              onClick={onRetry}
              className="underline hover:no-underline ml-1"
            >
              Tentar novamente
            </button>
          )}
        </>
      )}
    </div>
  );
}
