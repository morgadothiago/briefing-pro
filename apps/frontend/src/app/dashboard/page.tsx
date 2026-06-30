"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { LeadsTable } from "@/components/dashboard/leads-table";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { Lead, PaginatedResponse } from "@/types";

function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Lead>>("/api/leads", {
        params: { limit: 5, page: 1 },
      });
      return res.data;
    },
    refetchInterval: 30_000,
  });
}

export default function DashboardPage() {
  const { data, isLoading } = useLeads();
  const leads = data?.data ?? [];

  const stats = {
    total: data?.total ?? 0,
    waiting: leads.filter((l) =>
      ["CONTATO_FEITO", "FORMULARIO_ENVIADO"].includes(l.status)
    ).length,
    done: leads.filter((l) => l.status === "PROJETO_INICIADO").length,
    rate:
      data?.total
        ? `${Math.round(
            (leads.filter((l) => l.status === "PROJETO_INICIADO").length /
              (data.total || 1)) *
              100
          )}%`
        : "0%",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Visão geral do seu pipeline
        </p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-[#111827]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total de Leads"
            value={stats.total}
            icon={Users}
            iconColor="text-gray-300"
            iconBg="bg-gray-700/50"
          />
          <StatsCard
            label="Aguardando Resposta"
            value={stats.waiting}
            icon={Clock}
            iconColor="text-amber-400"
            iconBg="bg-amber-900/30"
          />
          <StatsCard
            label="Concluídos"
            value={stats.done}
            icon={CheckCircle}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-900/30"
          />
          <StatsCard
            label="Taxa de Conversão"
            value={stats.rate}
            icon={TrendingUp}
            iconColor="text-[#3B82F6]"
            iconBg="bg-[#3B82F6]/10"
          />
        </div>
      )}

      {/* Recent leads table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl">
        <div className="px-6 py-4 border-b border-[#1F2937] flex items-center justify-between">
          <h2 className="font-semibold text-white">Leads recentes</h2>
          <a
            href="/dashboard/leads"
            className="text-xs text-[#3B82F6] hover:underline"
          >
            Ver todos
          </a>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg bg-[#1F2937]" />
            ))}
          </div>
        ) : (
          <LeadsTable leads={leads} />
        )}
      </div>
    </div>
  );
}
