"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LeadCard } from "./lead-card";
import type { Lead } from "@/types";

interface KanbanColumnProps {
  id: string;
  title: string;
  leads: Lead[];
  columnIndex: number;
}

export function KanbanColumn({ id, title, leads, columnIndex }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className="flex flex-col min-w-[260px] max-w-[260px]"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
        <span className="text-xs bg-[#1F2937] text-gray-400 rounded-full px-2 py-0.5">
          {leads.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-3 space-y-2 min-h-[400px] transition-colors ${
          isOver
            ? "bg-[#3B82F6]/5 border border-[#3B82F6]/30"
            : "bg-[#111827] border border-[#1F2937]"
        }`}
      >
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-gray-600">
            Sem leads aqui
          </div>
        )}
      </div>
    </div>
  );
}
