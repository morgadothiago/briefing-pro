# Lead Warming Strategy

## Contexto

Automatizar o aquecimento de leads sem depender de WhatsApp API paga.
Fase 1 usa email (já disponível via Mailtrap/SMTP).
Fase 2 adiciona WhatsApp quando validado o fluxo.

---

## Máquina de estados

```
LEAD
  → CONTATO_FEITO          (link briefing enviado)
  → FORMULARIO_ENVIADO     (cliente abriu o briefing)
  → FORMULARIO_PREENCHIDO  (cliente finalizou)
  → PROPOSTA_ENVIADA       (agência enviou proposta)
  → FECHADO                (negócio fechado)
  → LEAD_FRIO              (sem resposta após 7 dias pós-proposta)
  → REATIVADO              (lead frio respondeu)
```

---

## Fase 1 — Email automático (implementar agora)

### Dependências
- `@nestjs/schedule` (CronJob)
- SMTP já configurado (Mailtrap em dev, Gmail/Resend em prod)

### Sequência de emails

| Trigger | Tempo | Template | Ação após envio |
|---|---|---|---|
| Lead criado com email | imediato | `welcome` | já existe |
| Link não aberto | +48h | `reminder_1` | registra evento |
| Link ainda não aberto | +96h | `reminder_2` (urgência) | registra evento |
| Briefing preenchido | imediato | `briefing_received` | já existe |
| Sem resposta pós-proposta | +7d | `follow_up` | status → `LEAD_FRIO` |
| Lead frio | +30d | `reactivation` | registra evento |

### Templates de email

#### reminder_1 (48h sem abrir)
```
Assunto: {projectName} — seu formulário está esperando

Oi {clientName},

Enviamos um formulário para entender melhor seu projeto {projectName}.
Leva cerca de 5 minutos para preencher.

→ Acessar formulário: {briefingLink}

Se tiver dúvidas ou quiser conversar antes, é só responder este email.

Até logo,
{adminName}
```

#### reminder_2 (96h sem abrir — urgência)
```
Assunto: Último lembrete — {projectName}

Oi {clientName},

Seu formulário de briefing expira em breve.
Após o vencimento, precisaremos reagendar do zero.

→ Preencher agora: {briefingLink}

Qualquer dúvida estou à disposição.

{adminName}
```

#### follow_up (7d sem resposta pós-proposta)
```
Assunto: Ainda pensando no {projectName}?

Oi {clientName},

Faz uma semana que enviei a proposta para {projectName}.
Queria saber se ficou alguma dúvida ou se posso ajudar em algo.

Se o momento não for ideal agora, sem problema — é só me avisar.

{adminName}
```

#### reactivation (30d frio)
```
Assunto: Uma ideia para o {projectName}

Oi {clientName},

Há um tempo conversamos sobre {projectName}.
Vi alguns cases recentes que podem te interessar e queria compartilhar.

Posso te enviar? É só responder com "sim".

{adminName}
```

---

## Fase 2 — WhatsApp (após validar fase 1)

### Opções por custo

| Opção | Custo | Risco ban | Complexidade |
|---|---|---|---|
| **Baileys** | gratuito | médio | média |
| **WPPConnect** | gratuito | médio | alta |
| **Z-API** | R$69/mês | baixo | baixa |
| **Evolution API** | gratuito (self-hosted) | baixo | alta |
| **Twilio** | ~U$0.005/msg | nenhum | baixa |

### Recomendação de adoção
1. Validar fluxo com email (fase 1)
2. Se taxa de resposta < 20%, adicionar WhatsApp via Z-API ou Baileys
3. Se volume > 100 leads/mês, migrar para Twilio ou Evolution API

### Templates WhatsApp (mesma lógica, tom mais curto)

```
AQUECIMENTO (link não aberto 48h):
"Oi {nome}! 👋 Seu formulário de {projeto} ainda está disponível.
Leva só 5min: {link}"

URGÊNCIA (96h):
"Oi {nome}, seu formulário expira em breve.
{link} — qualquer dúvida é só falar!"

LEAD FRIO:
"Oi {nome}! Ainda pensando no {projeto}?
Posso te ajudar com alguma dúvida? 🙂"

REATIVAÇÃO (30d):
"Oi {nome}! Faz um tempo... vi algo que pode
interessar para o {projeto}. Posso compartilhar?"
```

---

## Arquitetura backend

```
src/
  warming/
    warming.module.ts
    warming.service.ts      ← lógica de decisão por status/tempo
    warming.cron.ts         ← @Cron('0 * * * *') — roda todo hora
    warming.templates.ts    ← todos os templates centralizados
```

### Lógica do CronJob

```typescript
// a cada hora
async function runWarmingCycle() {
  const leads = await leadsRepo.findAllActive()

  for (const lead of leads) {
    const daysSinceCreated = diffDays(lead.createdAt, now)
    const daysSinceActivity = diffDays(lead.lastActivity, now)

    if (!lead.briefingOpenedAt && daysSinceCreated >= 2) {
      await sendEmail(lead, 'reminder_1')
    }

    if (!lead.briefingOpenedAt && daysSinceCreated >= 4) {
      await sendEmail(lead, 'reminder_2')
    }

    if (lead.status === 'PROPOSTA_ENVIADA' && daysSinceActivity >= 7) {
      await sendEmail(lead, 'follow_up')
      await updateStatus(lead.id, 'LEAD_FRIO')
    }

    if (lead.status === 'LEAD_FRIO' && daysSinceActivity >= 30) {
      await sendEmail(lead, 'reactivation')
    }
  }
}
```

### Controle de envios (evitar spam)

- Registrar cada email enviado em `emails_sent` (já existe no schema)
- Antes de enviar: verificar se template já foi enviado para o lead
- Máximo 1 email por template por lead

---

## KPIs para validar

| Métrica | Meta fase 1 |
|---|---|
| Taxa de abertura do briefing | > 60% |
| Taxa de preenchimento | > 40% |
| Leads que fecham | > 15% |
| Tempo médio lead → fechamento | < 14 dias |

---

## Próximos passos

- [ ] Implementar `WarmingModule` com CronJob
- [ ] Criar templates `reminder_1`, `reminder_2`, `follow_up`, `reactivation`
- [ ] Adicionar campo `briefingOpenedAt` no schema de leads
- [ ] Adicionar lógica de rastreamento de abertura de link (pixel 1x1 ou redirect)
- [ ] Dashboard de métricas de aquecimento
- [ ] Fase 2: avaliar Z-API ou Baileys conforme volume
