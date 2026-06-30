"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { Lead } from "@/types";

interface LeadCardProps {
  lead: Lead;
}

export function LeadCard({ lead }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-[#0A0F1E] border border-[#1F2937] rounded-xl p-4 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 hover:border-[#3B82F6]/30 transition-all duration-150"
    >
      <p className="text-sm font-semibold text-white leading-tight">
        {lead.projectName}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{lead.clientName}</p>

      {lead.estimatedValue && (
        <p className="text-xs text-[#F59E0B] mt-2 font-medium">
          R$ {lead.estimatedValue.toLocaleString("pt-BR")}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1 bg-[#1F2937] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3B82F6] rounded-full"
            style={{ width: `${(lead.briefingProgress / 12) * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-gray-500">
          {lead.briefingProgress}/12
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <StatusBadge status={lead.status} />
        <span className="text-[10px] text-gray-500">
          {formatDistanceToNow(new Date(lead.updatedAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        </span>
      </div>
    </div>
  );
}
