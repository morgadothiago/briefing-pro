"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KanbanColumn } from "@/components/pipeline/kanban-column";
import { LeadCard } from "@/components/pipeline/lead-card";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { Lead, PaginatedResponse } from "@/types";

const COLUMNS = [
  { id: "col-0", title: "Novo Lead", index: 0 },
  { id: "col-1", title: "Formulário", index: 1 },
  { id: "col-2", title: "Análise", index: 2 },
  { id: "col-3", title: "Reunião", index: 3 },
  { id: "col-4", title: "Escopo", index: 4 },
  { id: "col-5", title: "Proposta", index: 5 },
  { id: "col-6", title: "Contrato", index: 6 },
  { id: "col-7", title: "Pagamento", index: 7 },
  { id: "col-8", title: "Em Andamento", index: 8 },
];

export default function PipelinePage() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const { data, isLoading } = useQuery({
    queryKey: ["leads", "pipeline"],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Lead>>("/api/leads", {
        params: { limit: 200 },
      });
      return res.data.data;
    },
    refetchInterval: 30_000,
  });

  const leads = data ?? [];
  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const getLeadsForColumn = useCallback(
    (columnIndex: number) =>
      leads.filter((l) => l.kanbanColumn === columnIndex),
    [leads]
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const leadId = active.id as string;
    const overId = over.id as string;

    // Find the target column
    const targetCol = COLUMNS.find(
      (c) => c.id === overId || leads.find((l) => l.id === overId && l.kanbanColumn === c.index)
    );
    if (!targetCol) return;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.kanbanColumn === targetCol.index) return;

    // Optimistic update
    queryClient.setQueryData(["leads", "pipeline"], (old: Lead[] | undefined) =>
      old?.map((l) =>
        l.id === leadId ? { ...l, kanbanColumn: targetCol.index } : l
      )
    );

    try {
      await api.patch(`/api/leads/${leadId}/kanban`, {
        column: targetCol.index,
      });
    } catch {
      queryClient.invalidateQueries({ queryKey: ["leads", "pipeline"] });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Pipeline</h1>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((c) => (
            <Skeleton
              key={c.id}
              className="min-w-[260px] h-96 rounded-xl bg-[#111827]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Pipeline</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Arraste os cards para avançar as fases
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex gap-4 overflow-x-auto pb-6">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              leads={getLeadsForColumn(col.index)}
              columnIndex={col.index}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
