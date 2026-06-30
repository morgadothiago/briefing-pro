"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { BriefingData } from "@/types";

interface StepProps {
  data: BriefingData;
  onSubmit: (signatureData: BriefingData["step12"]) => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

const STEP_LABELS: Record<string, string> = {
  step1: "Dados da Empresa",
  step2: "Objetivos do Projeto",
  step3: "Tipo de Projeto",
  step4: "Funcionalidades",
  step5: "Requisitos Funcionais",
  step6: "Requisitos Não Funcionais",
  step7: "Integrações",
  step8: "Referências Visuais",
  step9: "Cronograma",
  step10: "Orçamento",
  step11: "Observações Finais",
};

export function Step12({ data, onSubmit, onPrev, isSubmitting }: StepProps) {
  const [signType, setSignType] = useState<"draw" | "text">("draw");
  const [textSign, setTextSign] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const hasDrawn = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
    }
  }, [signType]);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const source = "touches" in e ? e.touches[0] : e;
    return { x: source.clientX - rect.left, y: source.clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    hasDrawn.current = true;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx?.beginPath();
    ctx?.moveTo(pos.x, pos.y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx?.lineTo(pos.x, pos.y);
    ctx?.stroke();
  }

  function stopDraw() { isDrawing.current = false; }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    hasDrawn.current = false;
  }

  function handleSubmit() {
    setError("");
    if (signType === "draw" && !hasDrawn.current) {
      setError("Por favor, assine no campo acima.");
      return;
    }
    if (signType === "text" && !textSign.trim()) {
      setError("Digite seu nome completo como assinatura.");
      return;
    }
    if (!confirmed) {
      setError("Confirme as informações antes de enviar.");
      return;
    }
    const signatureData =
      signType === "draw"
        ? canvasRef.current?.toDataURL("image/png")
        : textSign.trim();
    onSubmit({ signatureType: signType, signatureData, confirmed });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Revisão e Assinatura</h2>
        <p className="text-sm text-gray-500 mt-1">
          Revise as informações preenchidas e assine para confirmar.
        </p>
      </div>

      {/* Summary accordion */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {Object.entries(data)
          .filter(([key]) => key.startsWith("step") && key !== "step12")
          .map(([key, val]) => (
            <details
              key={key}
              className="group border border-gray-200 rounded-xl overflow-hidden"
            >
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="text-sm font-medium text-gray-700">
                  {STEP_LABELS[key] ?? key}
                </span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">
                  ▼
                </span>
              </summary>
              <div className="px-4 py-3 bg-white">
                <pre className="text-xs text-gray-500 whitespace-pre-wrap font-sans">
                  {JSON.stringify(val, null, 2)}
                </pre>
              </div>
            </details>
          ))}
      </div>

      {/* Signature */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {(["draw", "text"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSignType(t)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                signType === t
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {t === "draw" ? "Assinar com desenho" : "Assinar com nome"}
            </button>
          ))}
        </div>

        {signType === "draw" ? (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-crosshair">
              <canvas
                ref={canvasRef}
                className="w-full touch-none"
                style={{ height: 200, display: "block" }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
            </div>
            <button
              type="button"
              onClick={clearCanvas}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Limpar assinatura
            </button>
          </div>
        ) : (
          <input
            value={textSign}
            onChange={(e) => setTextSign(e.target.value)}
            placeholder="Digite seu nome completo"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors font-medium italic"
            style={{ fontFamily: "Georgia, serif" }}
          />
        )}
      </div>

      {/* Confirmation checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600">
          Confirmo que as informações acima são verdadeiras e autorizo o uso
          deste documento para elaboração de proposta.
        </span>
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!confirmed || isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Enviando...
            </span>
          ) : (
            "Confirmar e Enviar Briefing"
          )}
        </button>
      </div>
    </div>
  );
}
