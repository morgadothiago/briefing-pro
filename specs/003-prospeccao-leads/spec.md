# Spec 003 — Prospecção Inteligente de Leads

## Visão

Expandir a página "Buscar Leads" em duas áreas distintas:
1. **Meus Leads** — pipeline existente (já implementado)
2. **Prospectar** — descoberta de leads na internet por palavras-chave + aquecimento por IA

---

## Área 1: Meus Leads (existente)

Tabela de leads cadastrados com busca local por cliente, projeto, email, status.
Já implementado em `/dashboard/buscar-leads`.

---

## Área 2: Prospectar Leads

### Fluxo completo

```
Admin define palavras-chave
        ↓
Sistema busca na web (Google Custom Search)
        ↓
IA analisa cada resultado e pontua relevância
        ↓
Admin visualiza lista de prospects com score
        ↓
Admin aprova prospect → lead criado automaticamente
        ↓
IA gera mensagem de abordagem personalizada
        ↓
Admin envia via WhatsApp / email com 1 clique
```

---

## Configuração de palavras-chave

Admin cadastra keywords no painel de Configurações:

```
Exemplos:
- "preciso criar um site"
- "quero desenvolver um app"
- "busco agência para sistema"
- "orçamento para software"
- "contratar desenvolvedor"
- "criar loja virtual"
```

Salvas no banco por `userId` — cada agência tem suas próprias keywords.

---

## Busca via Google Custom Search API

**Endpoint:** `https://www.googleapis.com/customsearch/v1`
**Custo:** 100 buscas/dia grátis, depois $5 por 1000 buscas
**Cobertura:** toda web pública — grupos Facebook públicos, Reddit BR, fóruns, Twitter/X, sites

### Parâmetros da busca

```typescript
{
  key: process.env.GOOGLE_SEARCH_API_KEY,
  cx: process.env.GOOGLE_SEARCH_ENGINE_ID,  // Custom Search Engine ID
  q: `"${keyword}" site:facebook.com OR site:reddit.com OR site:twitter.com OR site:linkedin.com`,
  lr: "lang_pt",           // resultados em português
  dateRestrict: "d7",      // últimos 7 dias
  num: 10                  // 10 resultados por busca
}
```

### Setup Google Custom Search
1. Criar projeto em console.cloud.google.com
2. Ativar "Custom Search API"
3. Criar Search Engine em programmablesearchengine.google.com
4. Copiar API Key e Search Engine ID para .env

---

## Análise por IA (Claude API)

Para cada resultado encontrado, Claude analisa e retorna:

### Prompt de análise de relevância

```
Você é um assistente de prospecção de clientes para uma agência de desenvolvimento de software.

Analise o seguinte conteúdo encontrado na web e determine:
1. Se é uma pessoa/empresa buscando serviços de desenvolvimento (site, app, sistema, e-commerce)
2. O nível de intenção de compra (1-10)
3. O nome/empresa do prospect (se identificável)
4. O tipo de projeto que precisam
5. Se tem informação de contato disponível

Conteúdo:
Título: {title}
URL: {url}
Trecho: {snippet}
Palavra-chave que gerou: {keyword}

Responda APENAS em JSON:
{
  "relevante": true/false,
  "score": 1-10,
  "nome_prospect": "string ou null",
  "tipo_projeto": "site|app|sistema|ecommerce|outro",
  "resumo": "1 frase explicando o que o prospect precisa",
  "tem_contato": true/false,
  "urgencia": "alta|media|baixa"
}
```

### Prompt de mensagem de abordagem

```
Você é um consultor de vendas de uma agência de desenvolvimento de software chamada {agencyName}.

Um prospect postou o seguinte na internet:
"{snippet}"

Contexto:
- Plataforma: {platform}
- Tipo de projeto identificado: {projectType}
- Score de intenção: {score}/10

Crie UMA mensagem de abordagem para WhatsApp que:
1. Seja natural e humana — NÃO pareça robótica ou spam
2. Mencione especificamente o que ele postou (mostre que leu)
3. Apresente brevemente a agência (1 frase)
4. Faça UMA pergunta aberta para iniciar conversa
5. Máximo 3 parágrafos curtos
6. Tom: profissional mas descontraído
7. Em português BR informal

NÃO use:
- "Olá! Vi seu post e gostaria de..."
- Emojis em excesso
- Listar serviços
- Pedir orçamento imediato
- Frases genéricas como "podemos te ajudar"

FORMATO de saída — apenas o texto da mensagem, sem explicações.
```

### Prompt de email de abordagem

```
Você é um consultor de vendas de {agencyName}.

Prospect: {prospectName}
O que postou: "{snippet}"
Tipo de projeto: {projectType}

Escreva um email frio de prospecção que:
1. Assunto: curto, específico ao projeto deles (não genérico)
2. Corpo: máximo 5 linhas
3. Mostre que entendeu o problema deles
4. Uma proposta de valor clara em 1 frase
5. CTA: agendar uma conversa de 15 minutos
6. Assinatura simples

Formato:
ASSUNTO: [assunto aqui]

[corpo do email]
```

---

## Schema de banco de dados

```sql
-- Palavras-chave de prospecção
CREATE TABLE prospecting_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  keyword TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Prospects encontrados
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  keyword TEXT NOT NULL,           -- keyword que gerou
  title TEXT,
  url TEXT NOT NULL,
  snippet TEXT,
  platform TEXT,                   -- facebook, reddit, twitter, etc
  ai_score INTEGER,                -- 1-10
  ai_summary TEXT,
  ai_project_type TEXT,
  ai_urgency TEXT,
  whatsapp_message TEXT,           -- mensagem gerada por IA
  email_message TEXT,
  status TEXT DEFAULT 'novo',      -- novo | aprovado | descartado | convertido
  lead_id UUID REFERENCES leads(id), -- preenchido quando convertido
  found_at TIMESTAMP DEFAULT now(),
  searched_at TIMESTAMP DEFAULT now()
);
```

---

## API Backend

```
GET    /api/prospecting/keywords          — listar keywords do admin
POST   /api/prospecting/keywords          — criar keyword
DELETE /api/prospecting/keywords/:id      — remover keyword

POST   /api/prospecting/search            — executar busca agora
GET    /api/prospecting/prospects         — listar prospects encontrados
PATCH  /api/prospecting/prospects/:id/approve  — aprovar → cria lead
PATCH  /api/prospecting/prospects/:id/discard  — descartar
POST   /api/prospecting/prospects/:id/message  — regenerar mensagem IA
```

---

## UI da página

```
/dashboard/buscar-leads
├── Tabs: [Meus Leads] [Prospectar]
│
└── Tab: Prospectar
    ├── Seção: Palavras-chave
    │   ├── Input para adicionar keyword
    │   └── Tags removíveis das keywords ativas
    │
    ├── Botão: [🔍 Buscar agora]
    │   └── Executa busca com todas as keywords
    │
    └── Resultados
        ├── Card por prospect com:
        │   ├── Score IA (badge colorido)
        │   ├── Plataforma (ícone)
        │   ├── Trecho do post
        │   ├── Resumo IA
        │   ├── Mensagem WhatsApp gerada (editável)
        │   └── Botões: [Aprovar → Lead] [WhatsApp] [Email] [Descartar]
        └── Filtros: score mínimo, plataforma, urgência
```

---

## Score e badges

| Score | Cor | Significado |
|---|---|---|
| 8-10 | 🟢 Verde | Alta intenção — abordar agora |
| 5-7 | 🟡 Amarelo | Média intenção — vale investigar |
| 1-4 | 🔴 Vermelho | Baixa intenção — descartar |

---

## Automação futura (fase 2)

- **CronJob diário** — executa buscas automaticamente todo dia às 8h
- **Notificação push** — avisa admin quando encontra prospect com score ≥ 8
- **Auto-approve** — prospects com score ≥ 9 viram leads automaticamente
- **Integração Zapier** — conectar com outras fontes (LinkedIn, etc)

---

## Variáveis de ambiente necessárias

```env
# Backend
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...
ANTHROPIC_API_KEY=...         # ou OPENAI_API_KEY

# Frontend
NEXT_PUBLIC_ADMIN_WHATSAPP=55119...
```

---

## Custo estimado por busca

| Operação | Custo |
|---|---|
| Google Custom Search (100/dia) | Grátis |
| Claude Haiku (análise por resultado) | ~$0.001 por prospect |
| Claude Sonnet (geração de mensagem) | ~$0.003 por mensagem |
| **Total por sessão (10 keywords × 10 resultados)** | **~$0.04** |

---

## Próximos passos de implementação

- [ ] Criar tabelas `prospecting_keywords` e `prospects` no schema Drizzle
- [ ] Implementar `ProspectingModule` no backend (NestJS)
- [ ] Integrar Google Custom Search API
- [ ] Integrar Claude API para análise + geração de mensagem
- [ ] Atualizar página `/dashboard/buscar-leads` com as duas tabs
- [ ] Cards de prospect com score visual e mensagem editável
- [ ] Botão "Aprovar → Lead" que cria lead automaticamente
- [ ] Configurações de keywords no painel de admin
