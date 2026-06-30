"use client";

import Link from "next/link";
import { Eye, Link2, Download } from "lucide-react";
import { StatusBadge } from "./status-badge";
import type { Lead } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface LeadsTableProps {
  leads: Lead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  function copyBriefingLink(token: string) {
    const url = `${window.location.origin}/b/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-sm">Nenhum lead cadastrado ainda.</p>
        <Link
          href="/dashboard/leads"
          className="mt-2 text-sm text-[#3B82F6] hover:underline"
        >
          Criar primeiro lead
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1F2937]">
            {["Cliente", "Projeto", "Status", "Progresso", "Última atividade", "Ações"].map(
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
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="hover:bg-[#1F2937]/30 transition-colors"
            >
              <td className="px-4 py-3 text-white font-medium">
                {lead.clientName}
              </td>
              <td className="px-4 py-3 text-gray-400">{lead.projectName}</td>
              <td className="px-4 py-3">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
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
                {formatDistanceToNow(new Date(lead.updatedAt), {
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
                      onClick={() => copyBriefingLink(lead.briefingToken!)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-[#1F2937] hover:text-white transition-colors"
                    >
                      <Link2 size={14} />
                    </button>
                  )}
                  <button className="p-1.5 rounded-lg text-gray-400 hover:bg-[#1F2937] hover:text-white transition-colors">
                    <Download size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
