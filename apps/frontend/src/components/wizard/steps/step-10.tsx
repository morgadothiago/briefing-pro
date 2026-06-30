"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { BriefingData } from "@/types";

const BUDGET_RANGES = [
  "Abaixo de R$ 5.000",
  "R$ 5.000 – R$ 15.000",
  "R$ 15.000 – R$ 50.000",
  "R$ 50.000 – R$ 150.000",
  "Acima de R$ 150.000",
  "Prefiro não informar",
];

interface StepProps {
  data: BriefingData["step10"];
  onSave: (data: BriefingData["step10"]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
}

export function Step10({ data, onSave, onNext, onPrev }: StepProps) {
  const [range, setRange] = useState(data?.budgetRange ?? "");
  const [notes, setNotes] = useState(data?.budgetNotes ?? "");

  function handleNext(skip = false) {
    onSave(skip ? { budgetRange: "Prefiro não informar", budgetNotes: "" } : { budgetRange: range, budgetNotes: notes });
    onNext();
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Orçamento</h2>
        <p className="text-sm text-gray-500 mt-1">
          Isso nos ajuda a propor soluções adequadas ao seu investimento.
        </p>
      </div>

      <div className="space-y-2">
        {BUDGET_RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 text-left text-sm transition-all",
              range === r
                ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                : "border-gray-200 text-gray-700 hover:border-gray-300"
            )}
          >
            {r}
            {range === r && (
              <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white" />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Observações sobre o orçamento (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Possibilidade de pagamento parcelado, restrições específicas..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
        >
          Anterior
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleNext(true)}
            className="border border-gray-200 text-gray-500 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50"
          >
            Pular esta etapa
          </button>
          <button
            type="button"
            onClick={() => handleNext(false)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}
