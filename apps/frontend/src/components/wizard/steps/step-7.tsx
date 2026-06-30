"use client";

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BriefingData } from "@/types";

const INTEGRATION_CATEGORIES = [
  {
    label: "Pagamentos",
    items: ["Stripe", "MercadoPago", "PagSeguro", "Cielo"],
  },
  {
    label: "ERP / CRM",
    items: ["TOTVS", "SAP", "Salesforce", "HubSpot"],
  },
  {
    label: "Comunicação",
    items: ["SendGrid", "Twilio", "WhatsApp Business"],
  },
  {
    label: "Google",
    items: ["Google Maps", "Google Analytics", "Tag Manager", "Google Drive"],
  },
  {
    label: "Redes Sociais",
    items: ["Meta (Facebook/Instagram)", "LinkedIn", "TikTok"],
  },
];

interface StepProps {
  data: BriefingData["step7"];
  onSave: (data: BriefingData["step7"]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
}

export function Step7({ data, onSave, onNext, onPrev }: StepProps) {
  const [selected, setSelected] = useState<string[]>(data?.integrations ?? []);
  const [custom, setCustom] = useState<string[]>(data?.customIntegrations ?? []);
  const [inputVal, setInputVal] = useState("");

  function toggle(item: string) {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  function addCustom() {
    const t = inputVal.trim();
    if (t && !custom.includes(t)) {
      setCustom((p) => [...p, t]);
      setInputVal("");
    }
  }

  function handleNext() {
    onSave({ integrations: selected, customIntegrations: custom });
    onNext();
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Integrações</h2>
        <p className="text-sm text-gray-500 mt-1">
          Quais sistemas externos o projeto precisa integrar?
        </p>
      </div>

      <div className="space-y-4">
        {INTEGRATION_CATEGORIES.map(({ label, items }) => (
          <div key={label}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {label}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const isSelected = selected.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggle(item)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all",
                      isSelected
                        ? "border-blue-400 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {isSelected && <Check size={12} />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Custom integrations */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Outras integrações
        </p>
        <div className="flex gap-2">
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
            placeholder="Ex: ERP interno, API legada..."
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
                  onClick={() => setCustom((p) => p.filter((x) => x !== f))}
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
