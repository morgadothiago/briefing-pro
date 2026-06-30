"use client";

import { useState, useRef } from "react";
import { Upload, X, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BriefingData } from "@/types";

const VISUAL_STYLES = [
  { id: "minimal", label: "Minimalista", desc: "Clean, espaços brancos" },
  { id: "corporate", label: "Corporativo", desc: "Formal, profissional" },
  { id: "colorful", label: "Colorido", desc: "Vibrante, criativo" },
  { id: "dark", label: "Dark / Tech", desc: "Escuro, moderno" },
];

interface StepProps {
  data: BriefingData["step8"];
  token: string;
  onSave: (data: BriefingData["step8"]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
}

export function Step8({ data, onSave, onNext, onPrev }: StepProps) {
  const [previews, setPreviews] = useState<string[]>(data?.uploadedFiles ?? []);
  const [referenceUrls, setReferenceUrls] = useState<string[]>(
    data?.referenceUrls ?? [""]
  );
  const [primaryColor, setPrimaryColor] = useState(data?.primaryColor ?? "#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState(
    data?.secondaryColor ?? "#1F2937"
  );
  const [tertiaryColor, setTertiaryColor] = useState(
    data?.tertiaryColor ?? "#F59E0B"
  );
  const [visualStyle, setVisualStyle] = useState(data?.visualStyle ?? "");
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = 5 - previews.length;
    Array.from(files)
      .slice(0, remaining)
      .forEach((file) => {
        if (file.size > 5 * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
  }

  function updateUrl(idx: number, val: string) {
    setReferenceUrls((prev) => prev.map((u, i) => (i === idx ? val : u)));
  }

  function addUrl() {
    setReferenceUrls((prev) => [...prev, ""]);
  }

  function removeUrl(idx: number) {
    setReferenceUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleNext() {
    onSave({
      uploadedFiles: previews,
      referenceUrls: referenceUrls.filter(Boolean),
      primaryColor,
      secondaryColor,
      tertiaryColor,
      visualStyle,
    });
    onNext();
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Referências Visuais</h2>
        <p className="text-sm text-gray-500 mt-1">
          Compartilhe o estilo visual que você tem em mente.
        </p>
      </div>

      {/* Upload area */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Imagens de referência (máx. 5, até 5MB cada)
        </label>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => previews.length < 5 && fileRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-200 hover:border-gray-300",
            previews.length >= 5 && "opacity-50 cursor-not-allowed"
          )}
        >
          <Upload size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            Arraste imagens aqui ou{" "}
            <span className="text-blue-500">clique para selecionar</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">{previews.length}/5 imagens</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPreviews((p) => p.filter((_, j) => j !== i)); }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reference URLs */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          URLs de referência
        </label>
        {referenceUrls.map((url, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              value={url}
              onChange={(e) => updateUrl(idx, e.target.value)}
              placeholder="https://exemplo.com"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {referenceUrls.length > 1 && (
              <button
                type="button"
                onClick={() => removeUrl(idx)}
                className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addUrl}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus size={14} />
          Adicionar URL
        </button>
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Paleta de cores</label>
        <div className="flex gap-4">
          {[
            { label: "Primária", value: primaryColor, onChange: setPrimaryColor },
            { label: "Secundária", value: secondaryColor, onChange: setSecondaryColor },
            { label: "Terciária", value: tertiaryColor, onChange: setTertiaryColor },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className="w-12 h-12 rounded-xl border border-gray-200 overflow-hidden cursor-pointer relative"
                style={{ backgroundColor: value }}
              >
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visual style */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Estilo visual</label>
        <div className="grid grid-cols-2 gap-2">
          {VISUAL_STYLES.map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => setVisualStyle(id)}
              className={cn(
                "flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all",
                visualStyle === id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              {visualStyle === id && (
                <Check size={14} className="text-blue-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className={cn("text-sm font-medium", visualStyle === id ? "text-blue-700" : "text-gray-700")}>
                  {label}
                </p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
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
