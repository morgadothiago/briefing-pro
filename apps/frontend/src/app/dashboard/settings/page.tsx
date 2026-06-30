"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, Link2, Phone, Mail, Save, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  whatsappNumber: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Profile {
  id: string;
  email: string;
  name?: string;
  logoUrl?: string;
  whatsappNumber?: string;
}

const inputCls =
  "w-full bg-[#0A0F1E] border border-[#1F2937] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors";

export default function SettingsPage() {
  const [showSmtp, setShowSmtp] = useState(false);

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get<Profile>("/api/auth/me");
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name ?? "",
        logoUrl: profile.logoUrl ?? "",
        whatsappNumber: profile.whatsappNumber ?? "",
      });
    }
  }, [profile, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === "" ? null : v])
      );
      return api.patch("/api/auth/profile", payload);
    },
    onSuccess: () => toast.success("Perfil atualizado!"),
    onError: () => toast.error("Erro ao salvar"),
  });

  const logoUrl = watch("logoUrl");

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-[#111827] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-sm text-gray-400 mt-0.5">Perfil e preferências da conta</p>
      </div>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6">
        {/* Perfil */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <User size={16} className="text-[#3B82F6]" />
            Perfil
          </h2>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#0A0F1E] border border-[#1F2937] overflow-hidden flex items-center justify-center shrink-0">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-2xl font-bold text-gray-600">
                  {profile?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              )}
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-400 block mb-1.5">
                URL da Logo
              </label>
              <input
                {...register("logoUrl")}
                placeholder="https://seu-site.com/logo.png"
                className={inputCls}
              />
              {errors.logoUrl && (
                <p className="text-xs text-red-400 mt-1">{errors.logoUrl.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Nome / Agência *</label>
            <input
              {...register("name")}
              placeholder="Seu nome ou nome da agência"
              className={inputCls}
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
              <Mail size={12} />
              Email
            </label>
            <input
              value={profile?.email ?? ""}
              disabled
              className={`${inputCls} opacity-50 cursor-not-allowed`}
            />
            <p className="text-xs text-gray-600">Email não pode ser alterado</p>
          </div>
        </div>

        {/* Contato */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Phone size={16} className="text-[#3B82F6]" />
            Contato
          </h2>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">WhatsApp</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                +55
              </span>
              <input
                {...register("whatsappNumber")}
                placeholder="11999999999"
                className={`${inputCls} pl-12`}
              />
            </div>
            <p className="text-xs text-gray-600">
              Usado no botão &ldquo;Entrar em contato&rdquo; da prospecção de leads
            </p>
          </div>
        </div>

        {/* SMTP Info */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Link2 size={16} className="text-[#3B82F6]" />
              Email (SMTP)
            </h2>
            <button
              type="button"
              onClick={() => setShowSmtp(!showSmtp)}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              {showSmtp ? <EyeOff size={12} /> : <Eye size={12} />}
              {showSmtp ? "Ocultar" : "Ver status"}
            </button>
          </div>

          {showSmtp && (
            <div className="bg-[#0A0F1E] border border-[#1F2937] rounded-xl p-4 space-y-3 text-xs">
              <p className="text-gray-300 font-medium">Config atual (env vars no Render):</p>
              <div className="grid grid-cols-2 gap-2 text-gray-400">
                <div>
                  <p className="text-gray-500">SMTP_HOST</p>
                  <p className="text-gray-200 font-mono">sandbox.smtp.mailtrap.io</p>
                </div>
                <div>
                  <p className="text-gray-500">SMTP_PORT</p>
                  <p className="text-gray-200 font-mono">587</p>
                </div>
              </div>
              <div className="p-3 bg-amber-900/20 border border-amber-500/20 rounded-lg">
                <p className="text-amber-400 font-medium mb-1">⚠ Modo sandbox ativo</p>
                <p className="text-gray-400">
                  Emails chegam só no inbox do Mailtrap — o cliente não recebe.
                </p>
                <p className="text-gray-400 mt-1">
                  Para envio real: troque para{" "}
                  <span className="text-white font-mono">live.smtp.mailtrap.io</span> com
                  credenciais do Email Delivery no Mailtrap.
                </p>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Configurado via env vars no Render. Emails de boas-vindas e briefing são disparados
            automaticamente.
          </p>
        </div>

        <button
          type="submit"
          disabled={!isDirty || isSubmitting}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Save size={14} />
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
