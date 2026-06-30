"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import type { BriefingData } from "@/types";

const schema = z.object({
  companyName: z.string().min(2, "Nome da empresa obrigatório"),
  cnpj: z.string().optional(),
  contactName: z.string().min(2, "Nome do responsável obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  website: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface StepProps {
  data: BriefingData["step1"];
  onSave: (data: BriefingData["step1"]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
}

function formatCNPJ(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white";

export function Step1({ data, onSave, onNext }: StepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: data });

  const cnpjValue = watch("cnpj");

  useEffect(() => {
    if (cnpjValue) {
      const formatted = formatCNPJ(cnpjValue);
      if (formatted !== cnpjValue) setValue("cnpj", formatted);
    }
  }, [cnpjValue, setValue]);

  function onSubmit(fd: FormData) {
    onSave(fd);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dados da Empresa</h2>
        <p className="text-sm text-gray-500 mt-1">
          Vamos começar com as informações básicas da sua empresa.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Nome da Empresa *
          </label>
          <input
            {...register("companyName")}
            placeholder="Empresa Ltda."
            className={inputCls}
          />
          {errors.companyName && (
            <p className="text-xs text-red-500">{errors.companyName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">CNPJ</label>
          <input
            {...register("cnpj")}
            placeholder="00.000.000/0000-00"
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Nome do Responsável *
          </label>
          <input
            {...register("contactName")}
            placeholder="João Silva"
            className={inputCls}
          />
          {errors.contactName && (
            <p className="text-xs text-red-500">
              {errors.contactName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Email *</label>
          <input
            {...register("email")}
            type="email"
            placeholder="contato@empresa.com"
            className={inputCls}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Telefone</label>
          <input
            {...register("phone")}
            placeholder="(11) 99999-9999"
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Site</label>
          <input
            {...register("website")}
            placeholder="https://www.empresa.com.br"
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
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
