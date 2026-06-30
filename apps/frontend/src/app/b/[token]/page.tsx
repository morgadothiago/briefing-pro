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
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          {/* Animated check */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg
              className="w-10 h-10 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Briefing enviado com sucesso!
          </h1>
          <p className="text-gray-500">
            Nossa equipe entrará em contato em breve para dar andamento ao seu
            projeto.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Você pode fechar esta janela.
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
