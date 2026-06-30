"use client";

import { useState } from "react";
import type { BriefingData } from "@/types";

interface StepProps {
  data: BriefingData;
  onSubmit: (data: BriefingData["step12"]) => void;
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
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!confirmed) {
      setError("Confirme as informações antes de enviar.");
      return;
    }
    setError("");
    onSubmit({ confirmed });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Revisão Final</h2>
        <p className="text-sm text-gray-500 mt-1">
          Revise as informações preenchidas antes de enviar.
        </p>
      </div>

      {/* Summary accordion */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
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
                <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">▼</span>
              </summary>
              <div className="px-4 py-3 bg-white">
                <pre className="text-xs text-gray-500 whitespace-pre-wrap font-sans">
                  {JSON.stringify(val, null, 2)}
                </pre>
              </div>
            </details>
          ))}
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
