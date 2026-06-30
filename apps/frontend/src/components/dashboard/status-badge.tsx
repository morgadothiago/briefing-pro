import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types";

const statusConfig: Record<
  LeadStatus,
  { label: string; className: string }
> = {
  LEAD: { label: "Lead", className: "bg-gray-700/50 text-gray-300" },
  CONTATO_FEITO: { label: "Contato feito", className: "bg-blue-900/40 text-blue-400" },
  FORMULARIO_ENVIADO: { label: "Form. enviado", className: "bg-blue-900/40 text-blue-400" },
  FORMULARIO_PREENCHIDO: { label: "Form. preenchido", className: "bg-amber-900/40 text-amber-400" },
  EM_ANALISE: { label: "Em análise", className: "bg-amber-900/40 text-amber-400" },
  ANALISADO: { label: "Analisado", className: "bg-emerald-900/40 text-emerald-400" },
  REUNIAO_AGENDADA: { label: "Reunião agendada", className: "bg-purple-900/40 text-purple-400" },
  REUNIAO_REALIZADA: { label: "Reunião realizada", className: "bg-purple-800/50 text-purple-300" },
  ESCOPO_GERADO: { label: "Escopo gerado", className: "bg-indigo-900/40 text-indigo-400" },
  ESCOPO_APROVADO: { label: "Escopo aprovado", className: "bg-indigo-800/50 text-indigo-300" },
  PROPOSTA_ENVIADA: { label: "Proposta enviada", className: "bg-orange-900/40 text-orange-400" },
  PROPOSTA_ACEITA: { label: "Proposta aceita", className: "bg-orange-800/50 text-orange-300" },
  PROPOSTA_REJEITADA: { label: "Proposta rejeitada", className: "bg-red-900/40 text-red-400" },
  CONTRATO_ENVIADO: { label: "Contrato enviado", className: "bg-teal-900/40 text-teal-400" },
  CONTRATO_ASSINADO: { label: "Contrato assinado", className: "bg-teal-800/50 text-teal-300" },
  AGUARDANDO_PAGAMENTO: { label: "Aguard. pagamento", className: "bg-yellow-900/40 text-yellow-400" },
  PAGO_PARCIAL: { label: "Pago parcial", className: "bg-green-900/40 text-green-400" },
  PAGO_TOTAL: { label: "Pago total", className: "bg-green-800/50 text-green-300" },
  PROJETO_INICIADO: { label: "Em andamento", className: "bg-green-800/60 text-green-300 font-semibold" },
};

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-gray-700 text-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
