"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { BriefingData } from "@/types";

const SECURITY_OPTIONS = [
  { value: "low", label: "Baixo", desc: "Dados não sensíveis" },
  { value: "medium", label: "Médio", desc: "Dados pessoais básicos" },
  { value: "high", label: "Alto", desc: "Dados financeiros / saúde" },
  { value: "lgpd", label: "LGPD crítico", desc: "Conformidade total exigida" },
];

const ACCESSIBILITY_OPTIONS = ["WCAG A", "WCAG AA", "WCAG AAA"];

const PERFORMANCE_LABELS = [
  "Básico",
  "Responsivo",
  "Rápido",
  "Muito rápido",
  "Alta performance",
  "Tempo real / Milissegundos",
];

interface StepProps {
  data: BriefingData["step6"];
  onSave: (data: BriefingData["step6"]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
}

export function Step6({ data, onSave, onNext, onPrev }: StepProps) {
  const [performance, setPerformance] = useState(data?.performance ?? 2);
  const [security, setSecurity] = useState(data?.security ?? "medium");
  const [concurrentUsers, setConcurrentUsers] = useState(
    data?.concurrentUsers ?? 100
  );
  const [accessibility, setAccessibility] = useState<string[]>(
    data?.accessibility ?? []
  );

  function toggleAccessibility(option: string) {
    setAccessibility((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  }

  function handleNext() {
    onSave({ performance, security, concurrentUsers, accessibility });
    onNext();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Requisitos Não Funcionais
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Defina os padrões de qualidade técnica do sistema.
        </p>
      </div>

      {/* Performance */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Performance
          </label>
          <span className="text-sm font-semibold text-blue-600">
            {PERFORMANCE_LABELS[performance]}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={5}
          value={performance}
          onChange={(e) => setPerformance(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>Básico</span>
          <span>Tempo real</span>
        </div>
      </div>

      {/* Security */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Nível de Segurança
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SECURITY_OPTIONS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSecurity(value)}
              className={cn(
                "flex flex-col p-3 rounded-xl border-2 text-left text-xs transition-all",
                security === value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <span
                className={cn(
                  "font-semibold text-sm mb-0.5",
                  security === value ? "text-blue-700" : "text-gray-700"
                )}
              >
                {label}
              </span>
              <span className="text-gray-400">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Concurrent users */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Volume de usuários simultâneos esperado
        </label>
        <input
          type="number"
          value={concurrentUsers}
          onChange={(e) => setConcurrentUsers(Number(e.target.value))}
          min={1}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
      </div>

      {/* Accessibility */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Acessibilidade
        </label>
        <div className="flex gap-2">
          {ACCESSIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleAccessibility(opt)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                accessibility.includes(opt)
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {opt}
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
