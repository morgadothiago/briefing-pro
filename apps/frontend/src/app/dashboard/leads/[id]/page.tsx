"use client";

import { useState } from "react";
import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Link2,
  Download,
  ArrowRight,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import api from "@/lib/api";
import type { Lead, Briefing, LeadNote } from "@/types";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LeadDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const res = await api.get<Lead>(`/api/leads/${id}`);
      return res.data;
    },
  });

  const { data: briefing } = useQuery({
    queryKey: ["briefing", id],
    queryFn: async () => {
      const res = await api.get<Briefing>(`/api/leads/${id}/briefing`);
      return res.data;
    },
    enabled: !!lead,
  });

  const { data: notes } = useQuery({
    queryKey: ["notes", id],
    queryFn: async () => {
      const res = await api.get<LeadNote[]>(`/api/leads/${id}/notes`);
      return res.data;
    },
    enabled: !!lead,
  });

  const NEXT_STATUS: Record<string, string> = {
    LEAD: "CONTATO_FEITO",
    CONTATO_FEITO: "FORMULARIO_ENVIADO",
    FORMULARIO_ENVIADO: "FORMULARIO_PREENCHIDO",
    FORMULARIO_PREENCHIDO: "PROPOSTA_ENVIADA",
    PROPOSTA_ENVIADA: "PROPOSTA_ACEITA",
    PROPOSTA_ACEITA: "FECHADO",
  };

  const advanceMutation = useMutation({
    mutationFn: (status: string) =>
      api.patch(`/api/leads/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      toast.success("Fase avançada!");
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: (content: string) =>
      api.post(`/api/leads/${id}/notes`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", id] });
      setNote("");
      toast.success("Nota salva");
    },
  });

  function copyBriefingLink() {
    if (!lead?.briefingToken) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/b/${lead.briefingToken}`
    );
    toast.success("Link copiado!");
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-[#111827]" />
        <Skeleton className="h-32 rounded-xl bg-[#111827]" />
        <Skeleton className="h-64 rounded-xl bg-[#111827]" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-gray-400 text-sm">Lead não encontrado.</div>
    );
  }

  const briefingData = briefing?.data ?? {};

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar para Leads
      </Link>

      {/* Header */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">
                {lead.projectName}
              </h1>
              <StatusBadge status={lead.status} />
            </div>
            <p className="text-gray-400">{lead.clientName}</p>
            {lead.email && (
              <p className="text-sm text-gray-500 mt-0.5">{lead.email}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyBriefingLink}
              className="inline-flex items-center gap-2 border border-[#1F2937] text-gray-300 px-3 py-2 rounded-lg text-xs hover:bg-[#1F2937] transition-colors"
            >
              <Link2 size={14} />
              Copiar link
            </button>
            <button className="inline-flex items-center gap-2 border border-[#1F2937] text-gray-300 px-3 py-2 rounded-lg text-xs hover:bg-[#1F2937] transition-colors">
              <Download size={14} />
              Exportar PDF
            </button>
            {lead.status !== "PROJETO_INICIADO" && NEXT_STATUS[lead.status] && (
              <button
                onClick={() => advanceMutation.mutate(NEXT_STATUS[lead.status])}
                disabled={advanceMutation.isPending}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 transition-all"
              >
                {advanceMutation.isPending ? "Salvando..." : "Avançar fase"}
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Briefing link */}
        {lead.briefingToken && (
          <div className="mt-4 bg-[#0A0F1E] border border-[#1F2937] rounded-lg p-3 flex items-center gap-2">
            <span className="text-xs text-gray-400 flex-1 truncate">
              Link do briefing: {typeof window !== "undefined" ? window.location.origin : ""}/b/{lead.briefingToken}
            </span>
            <button
              onClick={copyBriefingLink}
              className="p-1 rounded text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors"
            >
              <Copy size={12} />
            </button>
          </div>
        )}

        {/* Progress */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-[#1F2937] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3B82F6] rounded-full transition-all"
              style={{
                width: `${(lead.briefingProgress / 12) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm text-gray-400">
            {lead.briefingProgress}/12 etapas
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-[#111827] border border-[#1F2937] p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#1F2937] data-[state=active]:text-white text-gray-400">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="briefing" className="data-[state=active]:bg-[#1F2937] data-[state=active]:text-white text-gray-400">
            Briefing
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-[#1F2937] data-[state=active]:text-white text-gray-400">
            Notas
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Informações</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Cliente", value: lead.clientName },
                { label: "Projeto", value: lead.projectName },
                { label: "Email", value: lead.email ?? "—" },
                { label: "Telefone", value: lead.phone ?? "—" },
                { label: "Tipo", value: lead.projectType ?? "—" },
                {
                  label: "Valor estimado",
                  value: lead.estimatedValue
                    ? `R$ ${lead.estimatedValue.toLocaleString("pt-BR")}`
                    : "—",
                },
                {
                  label: "Criado",
                  value: format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm"),
                },
                {
                  label: "Atualizado",
                  value: formatDistanceToNow(new Date(lead.updatedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  }),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-gray-500 text-xs mb-0.5">{label}</p>
                  <p className="text-gray-200">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Briefing */}
        <TabsContent value="briefing" className="mt-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 space-y-4">
            {!briefing ? (
              <p className="text-gray-400 text-sm">
                Briefing não preenchido ainda.
              </p>
            ) : (
              (() => {
                const STEP_LABELS: Record<string, string> = {
                  step1: "Dados da Empresa",
                  step2: "Objetivos do Projeto",
                  step3: "Tipo de Projeto",
                  step4: "Funcionalidades",
                  step5: "Requisitos Funcionais",
                  step6: "Requisitos Não Funcionais",
                  step7: "Integrações",
                  step8: "Referências Visuais",
                  step9: "Cronograma",
                  step10: "Orçamento",
                  step11: "Observações Finais",
                  step12: "Confirmação",
                };
                const entries = Object.entries(briefingData).filter(
                  ([, val]) => val !== undefined && val !== null
                );
                if (entries.length === 0) {
                  return (
                    <p className="text-gray-400 text-sm">
                      Briefing iniciado mas sem dados salvos ainda.
                    </p>
                  );
                }
                return entries.map(([key, val]) => (
                  <div key={key} className="border-b border-[#1F2937] pb-4 last:border-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      {STEP_LABELS[key] ?? key.replace("step", "Etapa ")}
                    </p>
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                      {JSON.stringify(val, null, 2)}
                    </pre>
                  </div>
                ));
              })()
            )}
          </div>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="mt-4 space-y-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Notas internas</h2>
            <div className="space-y-3 mb-4">
              {(notes ?? []).map((n) => (
                <div
                  key={n.id}
                  className="bg-[#0A0F1E] border border-[#1F2937] rounded-lg p-3"
                >
                  <p className="text-sm text-gray-200">{n.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              ))}
              {(notes ?? []).length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma nota ainda.</p>
              )}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Adicionar nota interna..."
              rows={3}
              className="w-full bg-[#0A0F1E] border border-[#1F2937] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3B82F6] resize-none"
            />
            <button
              onClick={() => note.trim() && addNoteMutation.mutate(note.trim())}
              disabled={!note.trim() || addNoteMutation.isPending}
              className="mt-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 transition-all"
            >
              Salvar nota
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
