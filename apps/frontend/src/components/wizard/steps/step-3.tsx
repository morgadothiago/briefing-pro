"use client";

import { useState } from "react";
import {
  Smartphone,
  Globe,
  Monitor,
  Layers,
  ShoppingCart,
  Plus,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BriefingData } from "@/types";

const PROJECT_TYPES = [
  { id: "app-mobile", label: "App Mobile", icon: Smartphone },
  { id: "site-institucional", label: "Site Institucional", icon: Globe },
  { id: "sistema-web", label: "Sistema Web / ERP", icon: Monitor },
  { id: "saas", label: "SaaS / Produto Digital", icon: Layers },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingCart },
  { id: "outro", label: "Outro", icon: Plus },
];

interface StepProps {
  data: BriefingData["step3"];
  onSave: (data: BriefingData["step3"]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
}

export function Step3({ data, onSave, onNext, onPrev }: StepProps) {
  const [selected, setSelected] = useState<string[]>(data?.types ?? []);
  const [otherText, setOtherText] = useState(data?.otherType ?? "");
  const [error, setError] = useState("");

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
    setError("");
  }

  function handleNext() {
    if (selected.length === 0) {
      setError("Selecione ao menos um tipo de projeto.");
      return;
    }
    onSave({ types: selected, otherType: otherText });
    onNext();
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Tipo de Projeto</h2>
        <p className="text-sm text-gray-500 mt-1">
          Selecione todos os tipos que se aplicam (múltipla seleção).
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PROJECT_TYPES.map(({ id, label, icon: Icon }) => {
          const isSelected = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={cn(
                "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 text-sm font-medium transition-all duration-150",
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              )}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </span>
              )}
              <Icon size={24} className={isSelected ? "text-blue-500" : "text-gray-400"} />
              {label}
            </button>
          );
        })}
      </div>

      {selected.includes("outro") && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Descreva o tipo de projeto:
          </label>
          <input
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="Ex: Plataforma de marketplace..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

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
