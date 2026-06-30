"use client";

import { useForm } from "react-hook-form";
import type { BriefingData } from "@/types";

const FEATURE_QUESTIONS: Record<string, { label: string; placeholder: string }> = {
  "Login/Senha": {
    label: "Como deve funcionar o sistema de login/permissões?",
    placeholder: "Ex: Níveis de acesso (admin, usuário comum, gestor)...",
  },
  "OAuth (Google, GitHub)": {
    label: "Quais provedores OAuth serão suportados?",
    placeholder: "Ex: Google e GitHub, com vinculação de contas...",
  },
  PIX: {
    label: "Descreva como o fluxo de pagamento PIX deve funcionar:",
    placeholder: "Ex: QR code dinâmico, confirmação automática via webhook...",
  },
  "Cartão de crédito/débito": {
    label: "Como deve ser o checkout com cartão?",
    placeholder: "Ex: 1-clique, parcelamento em até 12x...",
  },
  "Chat em tempo real": {
    label: "Descreva o fluxo do chat:",
    placeholder: "Ex: Chat entre usuário e suporte, histórico, notificações...",
  },
  "Multi-tenant": {
    label: "Como deve funcionar o isolamento multi-tenant?",
    placeholder: "Ex: Subdomínio por tenant, banco de dados separado...",
  },
};

interface StepProps {
  data: BriefingData["step5"];
  step4Data: BriefingData["step4"];
  onSave: (data: BriefingData["step5"]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
}

const textareaCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none bg-white";

export function Step5({ data, step4Data, onSave, onNext, onPrev }: StepProps) {
  const selectedFeatures = step4Data?.features ?? [];
  const relevantQuestions = selectedFeatures
    .filter((f) => FEATURE_QUESTIONS[f])
    .map((f) => ({ key: f, ...FEATURE_QUESTIONS[f] }));

  const { register, handleSubmit } = useForm<Record<string, string>>({
    defaultValues: data ?? {},
  });

  function onSubmit(fd: Record<string, string>) {
    onSave(fd);
    onNext();
  }

  if (relevantQuestions.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Requisitos Funcionais</h2>
          <p className="text-sm text-gray-500 mt-1">
            Perguntas específicas com base nas funcionalidades selecionadas.
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 text-sm">
          Nenhuma pergunta específica para as funcionalidades selecionadas.
          <br />
          Avance para a próxima etapa.
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onPrev}
            className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => { onSave({}); onNext(); }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            Próximo
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Requisitos Funcionais</h2>
        <p className="text-sm text-gray-500 mt-1">
          Detalhe cada funcionalidade selecionada.
        </p>
      </div>

      {relevantQuestions.map(({ key, label, placeholder }) => (
        <div key={key} className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <textarea
            {...register(key)}
            placeholder={placeholder}
            rows={3}
            className={textareaCls}
          />
        </div>
      ))}

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
        >
          Anterior
        </button>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
        >
          Próximo
        </button>
      </div>
    </form>
  );
}
