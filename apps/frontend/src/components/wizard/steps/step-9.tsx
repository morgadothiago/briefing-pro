"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BriefingData } from "@/types";

const FLEXIBILITY_OPTIONS = [
  { value: "flexible", label: "Muito flexível", desc: "Sem pressa" },
  { value: "negotiable", label: "Pode negociar", desc: "Há margem" },
  { value: "fixed", label: "Prazo fixo", desc: "Sem extensão possível" },
];

interface StepProps {
  data: BriefingData["step9"];
  onSave: (data: BriefingData["step9"]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";

export function Step9({ data, onSave, onNext, onPrev }: StepProps) {
  const [desiredDeadline, setDesiredDeadline] = useState(data?.desiredDeadline ?? "");
  const [criticalDeadline, setCriticalDeadline] = useState(data?.criticalDeadline ?? "");
  const [importantDates, setImportantDates] = useState<{ label: string; date: string }[]>(
    data?.importantDates ?? []
  );
  const [flexibility, setFlexibility] = useState(data?.deadlineFlexibility ?? "negotiable");

  function addDate() {
    setImportantDates((p) => [...p, { label: "", date: "" }]);
  }

  function updateDate(idx: number, field: "label" | "date", val: string) {
    setImportantDates((p) =>
      p.map((d, i) => (i === idx ? { ...d, [field]: val } : d))
    );
  }

  function removeDate(idx: number) {
    setImportantDates((p) => p.filter((_, i) => i !== idx));
  }

  function handleNext() {
    onSave({
      desiredDeadline,
      criticalDeadline,
      importantDates: importantDates.filter((d) => d.label && d.date),
      deadlineFlexibility: flexibility,
    });
    onNext();
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Cronograma</h2>
        <p className="text-sm text-gray-500 mt-1">
          Defina as datas e prazos do projeto.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Prazo desejado
          </label>
          <input
            type="date"
            value={desiredDeadline}
            onChange={(e) => setDesiredDeadline(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Deadline crítico (opcional)
          </label>
          <input
            type="date"
            value={criticalDeadline}
            onChange={(e) => setCriticalDeadline(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Important dates */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Datas importantes
          </label>
          <button
            type="button"
            onClick={addDate}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <Plus size={12} />
            Adicionar data
          </button>
        </div>
        {importantDates.map((d, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              value={d.label}
              onChange={(e) => updateDate(idx, "label", e.target.value)}
              placeholder="Ex: Lançamento marketing"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <input
              type="date"
              value={d.date}
              onChange={(e) => updateDate(idx, "date", e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => removeDate(idx)}
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Flexibility */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Flexibilidade de prazo
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FLEXIBILITY_OPTIONS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFlexibility(value)}
              className={cn(
                "flex flex-col p-3 rounded-xl border-2 text-left transition-all",
                flexibility === value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <span className={cn("text-sm font-medium", flexibility === value ? "text-blue-700" : "text-gray-700")}>
                {label}
              </span>
              <span className="text-xs text-gray-400">{desc}</span>
            </button>
          ))}
        </div>
      </div>

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
          onClick={handleNext}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
