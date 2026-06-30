"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Link2, Download, Trash2, Copy } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import type { Lead, PaginatedResponse } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

const schema = z.object({
  clientName: z.string().min(2, "Nome obrigatório"),
  projectName: z.string().min(2, "Nome do projeto obrigatório"),
  clientEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  projectType: z.string().optional(),
  estimatedValue: z.number().min(0).optional(),
});

type FormData = z.infer<typeof schema>;

interface CreatedLead {
  id: string;
  briefingToken?: string;
}

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [createdLead, setCreatedLead] = useState<CreatedLead | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ["leads", "list"],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Lead>>("/api/leads", {
        params: { limit: 50 },
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (dto: FormData) => {
      const payload = Object.fromEntries(
        Object.entries(dto).filter(([, v]) => v !== "" && v !== undefined)
      );
      return api.post<Lead>("/api/leads", payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setCreatedLead({
        id: res.data.id,
        briefingToken: res.data.briefingToken,
      });
      reset();
      toast.success("Lead criado com sucesso!");
    },
    onError: () => toast.error("Erro ao criar lead"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead removido");
    },
  });

  const leads = data?.data ?? [];

  function copyBriefingLink(token: string) {
    const url = `${window.location.origin}/b/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }

  const inputCls =
    "w-full bg-[#0A0F1E] border border-[#1F2937] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {data?.total ?? 0} leads cadastrados
          </p>
        </div>
        <button
          onClick={() => {
            setCreatedLead(null);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-500 hover:to-blue-600 transition-all"
        >
          <Plus size={16} />
          Novo Lead
        </button>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg bg-[#1F2937]" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1F2937] flex items-center justify-center mb-4">
              <Plus size={24} className="text-gray-500" />
            </div>
            <p className="text-white font-medium mb-1">Nenhum lead ainda</p>
            <p className="text-sm text-gray-400 mb-4">
              Crie seu primeiro lead para começar o pipeline
            </p>
            <button
              onClick={() => setOpen(true)}
              className="text-sm text-[#3B82F6] hover:underline"
            >
              Criar lead
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F2937]">
                  {[
                    "Cliente",
                    "Projeto",
                    "Status",
                    "Progresso",
                    "Criado",
                    "Ações",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-[#1F2937]/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {lead.clientName}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {lead.projectName}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3B82F6] rounded-full"
                            style={{
                              width: `${(lead.briefingProgress / 12) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {lead.briefingProgress}/12
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {formatDistanceToNow(new Date(lead.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:bg-[#1F2937] hover:text-white transition-colors">
                            <Eye size={14} />
                          </button>
                        </Link>
                        {lead.briefingToken && (
                          <button
                            onClick={() =>
                              copyBriefingLink(lead.briefingToken!)
                            }
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-[#1F2937] hover:text-white transition-colors"
                          >
                            <Link2 size={14} />
                          </button>
                        )}
                        <button className="p-1.5 rounded-lg text-gray-400 hover:bg-[#1F2937] hover:text-white transition-colors">
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm("Remover este lead permanentemente?")
                            ) {
                              deleteMutation.mutate(lead.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Lead Dialog */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setCreatedLead(null);
        }}
      >
        <DialogContent className="bg-[#111827] border-[#1F2937] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {createdLead ? "Lead criado!" : "Novo Lead"}
            </DialogTitle>
          </DialogHeader>

          {createdLead ? (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-gray-400">
                Lead criado. Copie o link do briefing para enviar ao cliente:
              </p>
              {createdLead.briefingToken && (
                <div className="bg-[#0A0F1E] border border-[#1F2937] rounded-xl p-3 flex items-center gap-2">
                  <span className="flex-1 text-xs text-gray-300 truncate">
                    {typeof window !== "undefined" ? window.location.origin : ""}/b/{createdLead.briefingToken}
                  </span>
                  <button
                    onClick={() =>
                      copyBriefingLink(createdLead.briefingToken!)
                    }
                    className="p-1.5 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/leads/${createdLead.id}`}
                  className="flex-1 text-center bg-[#1F2937] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2D3748] transition-colors"
                >
                  Ver lead
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-500 hover:to-blue-600 transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit((d) => createMutation.mutate(d))}
              className="space-y-4 pt-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">
                    Nome do Cliente *
                  </label>
                  <input
                    {...register("clientName")}
                    placeholder="Empresa XYZ"
                    className={inputCls}
                  />
                  {errors.clientName && (
                    <p className="text-xs text-red-400">
                      {errors.clientName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">
                    Nome do Projeto *
                  </label>
                  <input
                    {...register("projectName")}
                    placeholder="App de vendas"
                    className={inputCls}
                  />
                  {errors.projectName && (
                    <p className="text-xs text-red-400">
                      {errors.projectName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">
                    Email
                  </label>
                  <input
                    {...register("clientEmail")}
                    type="email"
                    placeholder="cliente@email.com"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">
                    Telefone
                  </label>
                  <input
                    {...register("clientPhone")}
                    placeholder="(11) 99999-9999"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">
                    Tipo de Projeto
                  </label>
                  <input
                    {...register("projectType")}
                    placeholder="App Mobile, SaaS..."
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">
                    Valor Estimado (R$)
                  </label>
                  <input
                    {...register("estimatedValue", { valueAsNumber: true })}
                    type="number"
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? "Criando..." : "Criar Lead"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
