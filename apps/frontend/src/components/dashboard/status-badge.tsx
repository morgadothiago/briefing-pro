import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types";

const statusConfig: Record<
  LeadStatus,
  { label: string; className: string }
> = {
  LEAD: { label: "Lead", className: "bg-gray-700/50 text-gray-300" },
  CONTATO_FEITO: {
    label: "Contato feito",
    className: "bg-blue-900/40 text-blue-400",
  },
  FORMULARIO_ENVIADO: {
    label: "Form. enviado",
    className: "bg-blue-900/40 text-blue-400",
  },
  FORMULARIO_PREENCHIDO: {
    label: "Form. preenchido",
    className: "bg-amber-900/40 text-amber-400",
  },
  EM_ANALISE: {
    label: "Em análise",
    className: "bg-amber-900/40 text-amber-400",
  },
  ANALISADO: {
    label: "Analisado",
    className: "bg-emerald-900/40 text-emerald-400",
  },
  REUNIAO_AGENDADA: {
    label: "Reunião",
    className: "bg-purple-900/40 text-purple-400",
  },
  ESCOPO_DEFINIDO: {
    label: "Escopo",
    className: "bg-indigo-900/40 text-indigo-400",
  },
  PROPOSTA_ENVIADA: {
    label: "Proposta",
    className: "bg-orange-900/40 text-orange-400",
  },
  CONTRATO_ASSINADO: {
    label: "Contrato",
    className: "bg-teal-900/40 text-teal-400",
  },
  PAGAMENTO_RECEBIDO: {
    label: "Pagamento",
    className: "bg-green-900/40 text-green-400",
  },
  PROJETO_INICIADO: {
    label: "Em andamento",
    className: "bg-green-800/60 text-green-300 font-semibold",
  },
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
