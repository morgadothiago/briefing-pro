"use client";

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BriefingData } from "@/types";

const FEATURE_CATEGORIES = [
  {
    label: "Autenticação",
    features: ["Login/Senha", "OAuth (Google, GitHub)", "Autenticação 2FA"],
  },
  {
    label: "Pagamentos",
    features: ["PIX", "Cartão de crédito/débito", "Boleto bancário", "Assinatura recorrente"],
  },
  {
    label: "Comunicação",
    features: ["Chat em tempo real", "Email transacional", "Notificações push", "SMS"],
  },
  {
    label: "Analytics",
    features: ["Dashboard com métricas", "Relatórios customizados", "Exportação de dados"],
  },
  {
    label: "Infraestrutura",
    features: ["API REST", "Webhooks", "Integrações com terceiros", "Multi-tenant"],
  },
  {
    label: "Inteligência",
    features: ["IA / Machine Learning", "Busca semântica", "Automações"],
  },
];

interface StepProps {
  data: BriefingData["step4"];
  onSave: (data: BriefingData["step4"]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
}

export function Step4({ data, onSave, onNext, onPrev }: StepProps) {
  const [selected, setSelected] = useState<string[]>(data?.features ?? []);
  const [custom, setCustom] = useState<string[]>(data?.customFeatures ?? []);
  const [inputVal, setInputVal] = useState("");

  function toggleFeature(f: string) {
    setSelected((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  function addCustom() {
    const trimmed = inputVal.trim();
    if (trimmed && !custom.includes(trimmed)) {
      setCustom((prev) => [...prev, trimmed]);
      setInputVal("");
    }
  }

  function removeCustom(f: string) {
    setCustom((prev) => prev.filter((x) => x !== f));
  }

  function handleNext() {
    onSave({ features: selected, customFeatures: custom });
    onNext();
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Funcionalidades</h2>
        <p className="text-sm text-gray-500 mt-1">
          Selecione as funcionalidades que o projeto precisa ter.
        </p>
      </div>

      <div className="space-y-4">
        {FEATURE_CATEGORIES.map(({ label, features }) => (
          <div key={label}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((f) => {
                const isSelected = selected.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFeature(f)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm text-left transition-all",
                      isSelected
                        ? "border-blue-300 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300"
                      )}
                    >
                      {isSelected && <Check size={10} className="text-white" />}
                    </span>
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Custom features */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Funcionalidades adicionais
        </p>
        <div className="flex gap-2">
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
            placeholder="Digite e pressione Enter..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="button"
            onClick={addCustom}
            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        {custom.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {custom.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs"
              >
                {f}
                <button
                  type="button"
                  onClick={() => removeCustom(f)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-500 hover:to-blue-600 transition-all"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
