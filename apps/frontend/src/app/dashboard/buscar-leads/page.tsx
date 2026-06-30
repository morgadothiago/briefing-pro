"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { Lead, PaginatedResponse } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

export default function BuscarLeadsPage() {
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["leads", "list"],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Lead>>("/api/leads", {
        params: { limit: 200 },
      });
      return res.data;
    },
  });

  const leads = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.clientName?.toLowerCase().includes(q) ||
        l.projectName?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.projectType?.toLowerCase().includes(q)
    );
  }, [leads, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Buscar Leads</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Pesquise por cliente, projeto, email ou tipo
        </p>
      </div>

      {/* Search input */}
      <div className="relative max-w-xl">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite para buscar..."
          className="w-full bg-[#111827] border border-[#1F2937] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
        />
      </div>

      {/* Results */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg bg-[#1F2937]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search size={32} className="text-gray-600 mb-3" />
            <p className="text-white font-medium mb-1">
              {query ? "Nenhum lead encontrado" : "Nenhum lead cadastrado"}
            </p>
            <p className="text-sm text-gray-400">
              {query
                ? `Sem resultados para "${query}"`
                : "Crie um lead para começar"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F2937]">
                  {["Cliente", "Projeto", "Email", "Status", "Criado", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {filtered.map((lead) => (
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
                    <td className="px-4 py-3 text-gray-400">
                      {lead.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {formatDistanceToNow(new Date(lead.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-[#1F2937] hover:text-white transition-colors inline-flex"
                      >
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {query && (
              <div className="px-4 py-2 border-t border-[#1F2937]">
                <p className="text-xs text-gray-500">
                  {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para "{query}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
