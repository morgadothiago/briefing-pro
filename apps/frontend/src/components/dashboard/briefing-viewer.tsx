"use client";

import type { BriefingData } from "@/types";

interface Props {
  data: BriefingData;
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm text-gray-200">{value}</p>
    </div>
  );
}

function Tags({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="text-xs bg-[#1F2937] text-gray-300 border border-[#374151] px-2.5 py-1 rounded-lg">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#1F2937] rounded-xl overflow-hidden">
      <div className="bg-[#0A0F1E] px-4 py-2.5 border-b border-[#1F2937]">
        <p className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

export function BriefingViewer({ data }: Props) {
  const hasData = Object.values(data).some((v) => v !== undefined && v !== null);
  if (!hasData) {
    return <p className="text-gray-400 text-sm">Briefing não preenchido ainda.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Step 1 — Dados da Empresa */}
      {data.step1 && (
        <Section title="Dados da Empresa">
          <Field label="Empresa" value={data.step1.companyName} />
          <Field label="CNPJ" value={data.step1.cnpj} />
          <Field label="Responsável" value={data.step1.contactName} />
          <Field label="Email" value={data.step1.email} />
          <Field label="Telefone" value={data.step1.phone} />
          <Field label="Website" value={data.step1.website} />
        </Section>
      )}

      {/* Step 2 — Objetivos */}
      {data.step2 && (
        <Section title="Objetivos do Projeto">
          <div className="col-span-2">
            <Field label="Problema a resolver" value={data.step2.problem} />
          </div>
          <div className="col-span-2">
            <Field label="Público-alvo" value={data.step2.targetAudience} />
          </div>
          <div className="col-span-2">
            <Field label="Proposta de valor" value={data.step2.valueProposition} />
          </div>
          <div className="col-span-2">
            <Field label="Resultados esperados" value={data.step2.expectedResults} />
          </div>
        </Section>
      )}

      {/* Step 3 — Tipo de Projeto */}
      {data.step3 && (
        <Section title="Tipo de Projeto">
          <div className="col-span-2">
            <Tags label="Tipos" items={data.step3.types} />
          </div>
          {data.step3.otherType && (
            <div className="col-span-2">
              <Field label="Outro tipo" value={data.step3.otherType} />
            </div>
          )}
        </Section>
      )}

      {/* Step 4 — Funcionalidades */}
      {data.step4 && (
        <Section title="Funcionalidades">
          <div className="col-span-2">
            <Tags label="Funcionalidades" items={data.step4.features} />
          </div>
          {data.step4.customFeatures?.length ? (
            <div className="col-span-2">
              <Tags label="Funcionalidades personalizadas" items={data.step4.customFeatures} />
            </div>
          ) : null}
        </Section>
      )}

      {/* Step 5 — Requisitos Funcionais */}
      {data.step5 && Object.keys(data.step5).length > 0 && (
        <Section title="Requisitos Funcionais">
          {Object.entries(data.step5).map(([key, val]) => (
            <div key={key} className="col-span-2">
              <Field label={key} value={val} />
            </div>
          ))}
        </Section>
      )}

      {/* Step 6 — Requisitos Não Funcionais */}
      {data.step6 && (
        <Section title="Requisitos Não Funcionais">
          <Field label="Performance (1-10)" value={data.step6.performance} />
          <Field label="Segurança" value={data.step6.security} />
          <Field label="Usuários simultâneos" value={data.step6.concurrentUsers} />
          <div className="col-span-2">
            <Tags label="Acessibilidade" items={data.step6.accessibility} />
          </div>
        </Section>
      )}

      {/* Step 7 — Integrações */}
      {data.step7 && (
        <Section title="Integrações">
          <div className="col-span-2">
            <Tags label="Integrações" items={data.step7.integrations} />
          </div>
          {data.step7.customIntegrations?.length ? (
            <div className="col-span-2">
              <Tags label="Integrações personalizadas" items={data.step7.customIntegrations} />
            </div>
          ) : null}
        </Section>
      )}

      {/* Step 8 — Referências Visuais */}
      {data.step8 && (
        <Section title="Referências Visuais">
          <Field label="Estilo visual" value={data.step8.visualStyle} />
          <div className="col-span-2 flex gap-4">
            {data.step8.primaryColor && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Cor primária</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-[#374151]" style={{ backgroundColor: data.step8.primaryColor }} />
                  <span className="text-sm text-gray-300">{data.step8.primaryColor}</span>
                </div>
              </div>
            )}
            {data.step8.secondaryColor && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Cor secundária</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-[#374151]" style={{ backgroundColor: data.step8.secondaryColor }} />
                  <span className="text-sm text-gray-300">{data.step8.secondaryColor}</span>
                </div>
              </div>
            )}
            {data.step8.tertiaryColor && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Cor terciária</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-[#374151]" style={{ backgroundColor: data.step8.tertiaryColor }} />
                  <span className="text-sm text-gray-300">{data.step8.tertiaryColor}</span>
                </div>
              </div>
            )}
          </div>
          {data.step8.referenceUrls?.length ? (
            <div className="col-span-2 space-y-1">
              <p className="text-xs text-gray-500">URLs de referência</p>
              {data.step8.referenceUrls.map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block text-sm text-[#3B82F6] hover:underline truncate">{url}</a>
              ))}
            </div>
          ) : null}
        </Section>
      )}

      {/* Step 9 — Cronograma */}
      {data.step9 && (
        <Section title="Cronograma">
          <Field label="Prazo desejado" value={data.step9.desiredDeadline} />
          <Field label="Prazo crítico" value={data.step9.criticalDeadline} />
          <Field label="Flexibilidade" value={data.step9.deadlineFlexibility} />
          {data.step9.importantDates?.length ? (
            <div className="col-span-2 space-y-1">
              <p className="text-xs text-gray-500">Datas importantes</p>
              {data.step9.importantDates.map((d, i) => (
                <p key={i} className="text-sm text-gray-300">{d.label}: {d.date}</p>
              ))}
            </div>
          ) : null}
        </Section>
      )}

      {/* Step 10 — Orçamento */}
      {data.step10 && (
        <Section title="Orçamento">
          <Field label="Faixa de orçamento" value={data.step10.budgetRange} />
          <div className="col-span-2">
            <Field label="Observações" value={data.step10.budgetNotes} />
          </div>
        </Section>
      )}

      {/* Step 11 — Observações Finais */}
      {data.step11 && (
        <Section title="Observações Finais">
          <div className="col-span-2">
            <Field label="Anotações adicionais" value={data.step11.additionalNotes} />
          </div>
        </Section>
      )}

      {/* Step 12 — Confirmação */}
      {data.step12 && (
        <Section title="Confirmação e Assinatura">
          <Field label="Tipo de assinatura" value={data.step12.signatureType} />
          <Field label="Confirmado" value={data.step12.confirmed ? "Sim" : "Não"} />
          {data.step12.signatureType === "draw" && data.step12.signatureData && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Assinatura</p>
              <img
                src={data.step12.signatureData}
                alt="Assinatura"
                className="max-h-20 bg-white rounded border border-[#374151] p-1"
              />
            </div>
          )}
          {data.step12.signatureType === "text" && data.step12.signatureData && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Assinatura</p>
              <p className="text-lg text-gray-200 font-serif italic">{data.step12.signatureData}</p>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
