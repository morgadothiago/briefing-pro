"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { BriefingData } from "@/types";

const schema = z.object({
  problem: z.string().min(10, "Descreva o problema (mín. 10 caracteres)").max(500),
  targetAudience: z.string().min(5, "Descreva o público-alvo").max(500),
  valueProposition: z.string().min(5, "Descreva a proposta de valor").max(500),
  expectedResults: z.string().min(5, "Descreva os resultados esperados").max(500),
});

type FormData = z.infer<typeof schema>;

interface StepProps {
  data: BriefingData["step2"];
  onSave: (data: BriefingData["step2"]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
}

const textareaCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none bg-white";

function CharCounter({ value, max }: { value: string; max: number }) {
  const count = value?.length ?? 0;
  return (
    <span className={`text-xs ${count > max * 0.9 ? "text-amber-500" : "text-gray-400"}`}>
      {count}/{max}
    </span>
  );
}

export function Step2({ data, onSave, onNext, onPrev }: StepProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: data });

  const values = watch();

  function onSubmit(fd: FormData) {
    onSave(fd);
    onNext();
  }

  const fields = [
    {
      name: "problem" as const,
      label: "Qual problema o projeto resolve?",
      placeholder:
        "Descreva o problema central que o produto vai solucionar...",
    },
    {
      name: "targetAudience" as const,
      label: "Quem é o público-alvo?",
      placeholder: "Descreva quem são os usuários principais do produto...",
    },
    {
      name: "valueProposition" as const,
      label: "Qual a proposta de valor?",
      placeholder:
        "Por que os usuários vão escolher este produto em vez de alternativas...",
    },
    {
      name: "expectedResults" as const,
      label: "Resultados esperados / KPIs",
      placeholder: "Ex: Reduzir tempo de processo em 50%, 1000 usuários em 6 meses...",
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Objetivos do Projeto</h2>
        <p className="text-sm text-gray-500 mt-1">
          Entenda profundamente o que você quer alcançar.
        </p>
      </div>

      {fields.map(({ name, label, placeholder }) => (
        <div key={name} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <CharCounter value={values[name] ?? ""} max={500} />
          </div>
          <textarea
            {...register(name)}
            placeholder={placeholder}
            rows={3}
            className={textareaCls}
          />
          {errors[name] && (
            <p className="text-xs text-red-500">{errors[name]?.message}</p>
          )}
        </div>
      ))}

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Anterior
        </button>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-500 hover:to-blue-600 transition-all"
        >
          Próximo
        </button>
      </div>
    </form>
  );
}
