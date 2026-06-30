"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { WizardContainer } from "@/components/wizard/wizard-container";
import api from "@/lib/api";
import type { Briefing } from "@/types";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function BriefingPage({ params }: PageProps) {
  const { token } = use(params);
  const [submitted, setSubmitted] = useState(false);

  const { data: briefing, isLoading, error } = useQuery({
    queryKey: ["briefing", token],
    queryFn: async () => {
      const res = await api.get<Briefing>(`/api/briefing/${token}`);
      return res.data;
    },
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: () => api.post(`/api/briefing/${token}/submit`),
    onSuccess: () => setSubmitted(true),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <div className="text-center py-4 border-b border-gray-100 bg-white">
          <span className="text-lg font-bold text-gray-900">
            Briefing<span className="text-blue-500">Pro</span>
          </span>
        </div>
        {/* Progress skeleton */}
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-2 rounded-full bg-gray-200" />
            <div className="mt-3 flex justify-between">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="w-7 h-7 rounded-full bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-start justify-center px-4 py-6">
          <div className="w-full max-w-2xl">
            <Skeleton className="h-96 rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (error) {
    const status = (error as { response?: { status?: number } }).response?.status;

    if (status === 410) {
      return (
        <ErrorPage
          title="Este link expirou"
          message="O prazo para preencher este briefing foi encerrado. Entre em contato com o profissional para solicitar um novo link."
        />
      );
    }

    return (
      <ErrorPage
        title="Link inválido"
        message="Não foi possível encontrar este briefing. Verifique se o link está correto ou entre em contato com o profissional."
      />
    );
  }

  if (!briefing) return null;

  // Already submitted
  if (briefing.submittedAt || submitted) {
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? "";
    const waMessage = encodeURIComponent(
      `Olá! Acabei de preencher o briefing do projeto *${briefing.lead?.projectName ?? ""}*. Pode verificar? 🙂`
    );
    const waUrl = `https://wa.me/${adminPhone}?text=${waMessage}`;

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Briefing enviado com sucesso!
          </h1>
          <p className="text-gray-500 mb-6">
            Nossa equipe entrará em contato em breve para dar andamento ao seu projeto.
          </p>
          {adminPhone && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#1ebe5a] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar com nossa equipe no WhatsApp
            </a>
          )}
          <p className="text-sm text-gray-400 mt-4">
            Você também pode fechar esta janela.
          </p>
        </div>
      </div>
    );
  }

  return (
    <WizardContainer
      briefing={briefing}
      onComplete={() => submitMutation.mutate()}
    />
  );
}

function ErrorPage({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}
