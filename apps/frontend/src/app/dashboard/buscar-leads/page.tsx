"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Eye,
  Radar,
  Plus,
  Trash2,
  ExternalLink,
  MessageCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Tag,
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { Lead, PaginatedResponse } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { toast } from "sonner";

interface Keyword {
  id: string;
  keyword: string;
  createdAt: string;
}

interface SearchResult {
  id: string;
  keyword: string;
  title: string;
  url: string;
  snippet: string;
  platform: string;
  score: number;
  summary: string;
  projectType: string;
  urgency: "alta" | "media" | "baixa";
  whatsappMessage: string;
}

const URGENCY_BADGE: Record<string, string> = {
  alta: "bg-red-500/15 text-red-400 border border-red-500/20",
  media: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  baixa: "bg-gray-500/15 text-gray-400 border border-gray-500/20",
};

const URGENCY_LABEL: Record<string, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export default function BuscarLeadsPage() {
  const [activeTab, setActiveTab] = useState<"leads" | "prospeccao">("leads");
  const [query, setQuery] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const qc = useQueryClient();

  // ─── Meus Leads ───────────────────────────────────────────────────────────
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ["leads", "list"],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Lead>>("/api/leads", {
        params: { limit: 200 },
      });
      return res.data;
    },
  });

  const leads = leadsData?.data ?? [];

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

  // ─── Keywords ─────────────────────────────────────────────────────────────
  const { data: keywords = [], isLoading: kwLoading } = useQuery<Keyword[]>({
    queryKey: ["prospecting", "keywords"],
    queryFn: async () => {
      const res = await api.get<Keyword[]>("/api/prospecting/keywords");
      return res.data;
    },
  });

  const addKeywordMut = useMutation({
    mutationFn: (keyword: string) =>
      api.post("/api/prospecting/keywords", { keyword }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospecting", "keywords"] });
      setNewKeyword("");
      toast.success("Palavra-chave adicionada");
    },
  });

  const removeKeywordMut = useMutation({
    mutationFn: (id: string) => api.delete(`/api/prospecting/keywords/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospecting", "keywords"] });
      toast.success("Palavra-chave removida");
    },
  });

  // ─── Search ───────────────────────────────────────────────────────────────
  const {
    data: results = [],
    isLoading: searching,
    refetch: runSearch,
    isFetched,
  } = useQuery<SearchResult[]>({
    queryKey: ["prospecting", "search"],
    queryFn: async () => {
      const res = await api.post<SearchResult[]>("/api/prospecting/search");
      return res.data;
    },
    enabled: false,
    staleTime: 0,
  });

  function copyWA(msg: string) {
    navigator.clipboard.writeText(msg);
    toast.success("Mensagem copiada!");
  }

  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Buscar Leads</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Filtre seus leads ou prospecte novos na internet
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1F2937] rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("leads")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "leads"
              ? "bg-[#1F2937] text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Search size={14} />
          Meus Leads
        </button>
        <button
          onClick={() => setActiveTab("prospeccao")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "prospeccao"
              ? "bg-[#1F2937] text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Radar size={14} />
          Prospectar
        </button>
      </div>

      {/* ─── Tab: Meus Leads ─── */}
      {activeTab === "leads" && (
        <>
          <div className="relative max-w-xl">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite para buscar por cliente, projeto, email..."
              className="w-full bg-[#111827] border border-[#1F2937] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
            />
          </div>

          <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
            {leadsLoading ? (
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
                      {filtered.length} resultado
                      {filtered.length !== 1 ? "s" : ""} para &ldquo;{query}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── Tab: Prospectar ─── */}
      {activeTab === "prospeccao" && (
        <div className="space-y-6">
          {/* Keywords */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6">
            <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
              <Tag size={16} className="text-[#3B82F6]" />
              Palavras-chave para busca
            </h2>
            <p className="text-xs text-gray-500 mb-1">
              O sistema busca no Google por pessoas procurando contratar serviços digitais.
            </p>
            <p className="text-xs text-blue-400/70 mb-4">
              💡 Use frases de intenção de compra: <span className="font-medium">&quot;procuro desenvolvedor web&quot;</span>, <span className="font-medium">&quot;quero contratar agência&quot;</span>, <span className="font-medium">&quot;preciso de sistema para empresa&quot;</span>
            </p>

            {/* Add form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newKeyword.trim()) addKeywordMut.mutate(newKeyword.trim());
              }}
              className="flex gap-2 mb-4"
            >
              <input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder='Ex: "procuro desenvolvedor web", "quero contratar agência digital"'
                className="flex-1 bg-[#0A0F1E] border border-[#1F2937] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3B82F6] transition-colors"
              />
              <button
                type="submit"
                disabled={!newKeyword.trim() || addKeywordMut.isPending}
                className="flex items-center gap-2 bg-[#3B82F6] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-all"
              >
                <Plus size={14} />
                Adicionar
              </button>
            </form>

            {/* Keyword list */}
            {kwLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-9 rounded-lg bg-[#1F2937]" />
                ))}
              </div>
            ) : keywords.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nenhuma palavra-chave ainda. Adicione acima.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw) => (
                  <div
                    key={kw.id}
                    className="flex items-center gap-2 bg-[#0A0F1E] border border-[#1F2937] rounded-lg px-3 py-1.5"
                  >
                    <span className="text-sm text-gray-300">{kw.keyword}</span>
                    <button
                      onClick={() => removeKeywordMut.mutate(kw.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search button */}
          <button
            onClick={() => runSearch()}
            disabled={searching || keywords.length === 0}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 transition-all"
          >
            <Radar size={16} className={searching ? "animate-spin" : ""} />
            {searching ? "Buscando..." : "Buscar Leads na Internet"}
          </button>

          {/* Results */}
          {isFetched && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">
                  {results.length > 0
                    ? `${results.length} prospectos encontrados`
                    : "Nenhum resultado encontrado"}
                </h2>
                {results.length > 0 && (
                  <p className="text-xs text-gray-500">Ordenado por relevância</p>
                )}
              </div>

              {results.map((r) => (
                <div
                  key={r.id}
                  className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-medium bg-[#1F2937] text-gray-300 px-2 py-0.5 rounded">
                            {r.platform}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${URGENCY_BADGE[r.urgency]}`}
                          >
                            {URGENCY_LABEL[r.urgency]} urgência
                          </span>
                          <span className="text-xs text-gray-600">
                            Palavra: &ldquo;{r.keyword}&rdquo;
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-white truncate">
                          {r.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                          {r.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex flex-col items-center bg-[#0A0F1E] rounded-lg px-2 py-1">
                          <span className="text-xs font-bold text-[#3B82F6]">
                            {r.score}
                          </span>
                          <span className="text-[10px] text-gray-600">/10</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-[#1F2937] px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink size={12} />
                        Ver post
                      </a>
                      <button
                        onClick={() => copyWA(r.whatsappMessage)}
                        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-[#1F2937] px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Copy size={12} />
                        Copiar mensagem
                      </button>
                      {adminPhone && (
                        <a
                          href={`https://wa.me/${adminPhone}?text=${encodeURIComponent(r.whatsappMessage)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-white bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <MessageCircle size={12} />
                          Entrar em contato
                        </a>
                      )}
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === r.id ? null : r.id)
                        }
                        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white px-2 py-1.5 transition-colors"
                      >
                        {expandedId === r.id ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )}
                        Mensagem
                      </button>
                    </div>

                    {expandedId === r.id && (
                      <div className="mt-3 bg-[#0A0F1E] border border-[#1F2937] rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1 font-medium">
                          MENSAGEM WHATSAPP
                        </p>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {r.whatsappMessage}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
