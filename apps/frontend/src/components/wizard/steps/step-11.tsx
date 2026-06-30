"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import type { BriefingData } from "@/types";

interface StepProps {
  data: BriefingData["step11"];
  onSave: (data: BriefingData["step11"]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
}

export function Step11({ data, onSave, onNext, onPrev }: StepProps) {
  const [notes, setNotes] = useState(data?.additionalNotes ?? "");
  const [docs, setDocs] = useState<string[]>(data?.uploadedDocs ?? []);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      setDocs((p) => [...p, file.name]);
    });
  }

  function handleNext() {
    onSave({ additionalNotes: notes, uploadedDocs: docs });
    onNext();
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Observações Finais</h2>
        <p className="text-sm text-gray-500 mt-1">
          Qualquer informação adicional que queira compartilhar.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Há algo mais que gostaria de compartilhar?
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Restrições técnicas, preferências, histórico do projeto, experiências anteriores..."
          rows={6}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Document upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Documentos de referência (PDF, DOCX)
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-gray-300 transition-colors"
        >
          <Upload size={20} className="mx-auto text-gray-400 mb-1.5" />
          <p className="text-sm text-gray-500">
            Clique para anexar documentos
          </p>
          <p className="text-xs text-gray-400 mt-0.5">PDF, DOCX até 10MB</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {docs.length > 0 && (
          <ul className="space-y-1">
            {docs.map((doc, i) => (
              <li
                key={i}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <span className="text-gray-700">{doc}</span>
                <button
                  type="button"
                  onClick={() => setDocs((p) => p.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
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
