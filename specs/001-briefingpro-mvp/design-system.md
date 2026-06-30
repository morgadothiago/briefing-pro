# Design System — BriefingPro

## Filosofia
Enterprise dark theme no painel admin. Clean profissional no wizard do cliente.
Transmite: empresa sólida, processo estruturado, confiança técnica.

---

## Paleta de Cores

```css
/* Admin (dark) */
--color-primary:    #0A0F1E;  /* Navy quase preto — fundo principal */
--color-secondary:  #1E3A5F;  /* Azul navy profundo */
--color-accent:     #3B82F6;  /* Azul elétrico — CTAs, destaques */
--color-gold:       #F59E0B;  /* Âmbar/dourado — badges, premium */
--color-surface:    #111827;  /* Cards dark */
--color-border:     #1F2937;
--color-text-1:     #F9FAFB;  /* Texto primário */
--color-text-2:     #9CA3AF;  /* Texto secundário */
--color-success:    #10B981;
--color-warning:    #F59E0B;
--color-error:      #EF4444;

/* Wizard do cliente (light) */
--color-bg:         #F8FAFC;
--color-card:       #FFFFFF;
--color-text:       #0F172A;
```

---

## Tipografia

- Fonte: **Inter** (Google Fonts) — weights 300 / 400 / 500 / 600 / 700 / 800
- Headings: font-weight 700–800, letter-spacing tight (`-0.02em`)
- Body: font-weight 400, line-height 1.6
- Labels / caps: uppercase, tracking-widest, font-size xs

```tailwind
/* Tailwind config additions */
fontFamily: { sans: ['Inter', 'sans-serif'] }
```

---

## Landing Page / Login do Admin

- Hero com gradiente dark navy → azul escuro
- Headline forte (ex: "Profissionalize seu processo de vendas")
- Sub-headline descritiva + CTA button com gradiente + glow effect sutil
- 3 feature cards com ícones Lucide:
  - Wizard inteligente / Export PDF profissional / Dashboard em tempo real
- Social proof: "+500 agências confiam" com avatars placeholder
- Trusted-by logos row (placeholders geométricos)
- Footer minimalista com copyright

---

## Dashboard Admin

- **Sidebar** dark (#0A0F1E) com logo no topo
- Navigation: hover state azul + indicador de rota ativa à esquerda
- **Top bar**: search + avatar + notifications icon
- **Stats cards** (4):
  - Total Briefings | Aguardando Resposta | Concluídos | Taxa de Conclusão
  - Borda sutil + ícone colorido (Lucide) + número grande bold
- **Tabela de projetos**: status badges pill style
  - `draft` → cinza | `sent` → azul | `in_progress` → âmbar | `completed` → verde | expired → vermelho
- Empty state ilustrado quando vazio

---

## Wizard do Cliente (link único)

- **Background**: branco / light (#F8FAFC) — contrasta com admin dark
- **Progress bar** no topo: linha contínua + steps numerados com check SVG quando completo
- **Card central**: sombra suave, max-w-2xl, centralizado
- Step title grande + subtitle descritivo por etapa
- Botões Anterior / Próximo no rodapé do card
- **Animação de transição** entre steps: slide horizontal (framer-motion)
- Checkboxes e radios customizados (não browser default)
- Upload drag-and-drop visual com preview de imagem
- **Assinatura digital**: canvas HTML5 com botão "Limpar"

---

## PDF Exportado

- **Capa**: fundo navy (#0A0F1E), logo branco centralizado, título, cliente, data
- **Páginas internas**: fundo branco, header com logo pequeno + nome do projeto
- Seções: título colorido (azul), linha separadora, conteúdo limpo
- Tabelas: header navy + linhas alternadas (zebra strip)
- Footer: número de página + "Documento gerado por [Nome da Empresa]"
- Fonte: Helvetica ou Inter embedded

---

## Componentes Globais

| Componente | Especificação |
|------------|---------------|
| Buttons | `rounded-lg` (não pill), gradient azul para primary, ghost para secondary |
| Inputs | border sutil, focus ring azul (`ring-blue-500`), label acima sempre |
| Cards | `rounded-xl`, `shadow-sm`, hover lift sutil (`translateY(-2px)`) |
| Badges | `rounded-full`, variant por status |
| Toasts | canto inferior direito, dark style (sonner) |
| Loading | Skeleton screens (não spinner) |
| Modals | backdrop blur, centralizado, animation scale-in |

---

## Micro-interações

- Cards hover: `translateY(-2px)` + shadow increase
- Botão CTA: gradient shift on hover
- Progress bar: animated fill (CSS transition)
- Success: checkmark animado (CSS keyframes ou Lottie)
- Form fields: label above estático (não float)

---

## Responsividade

- **Mobile-first** obrigatório
- Wizard: fullscreen no mobile, card centralizado no desktop
- Dashboard: sidebar colapsa em hamburger menu no mobile
- PDF: sempre gerado em tamanho A4 (server-side)

---

## Tailwind Config Essencial

```ts
// tailwind.config.ts
colors: {
  navy: {
    900: '#0A0F1E',
    800: '#111827',
    700: '#1F2937',
    600: '#1E3A5F',
  },
  accent: '#3B82F6',
  gold:   '#F59E0B',
}
```
