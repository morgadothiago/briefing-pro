# BriefingPro

Sistema de gestao de briefings para agencias criativas e freelancers de tecnologia. Permite criar projetos de briefing, gerar um link unico para o cliente preencher, acompanhar o progresso em tempo real e exportar um PDF profissional ao final.

## A ideia

Recebi de clientes explicacoes de projeto por WhatsApp ou ligacao, sem padrao nenhum, o que gerava retrabalho e informacao perdida. A ideia do BriefingPro e o proprio cliente preencher um wizard de 12 etapas (dados da empresa, objetivos, tipo de projeto, funcionalidades desejadas, requisitos, integracoes, referencias visuais, cronograma, orcamento) e assinar digitalmente no final. O freelancer ou a agencia recebe tudo organizado e pode exportar em PDF.

## Como foi desenvolvido

O projeto esta sendo construido com Spec-Driven Development (SDD): antes de escrever codigo, cada funcionalidade e planejada em specs numeradas dentro da pasta specs/ (001-briefingpro-mvp, 002-lead-warming, 003-prospeccao-leads), cada uma com spec.md (requisitos e casos de uso), plan.md (plano tecnico) e tasks.md (tarefas). Isso mantem o escopo claro antes da implementacao.

Parte da implementacao foi feita com apoio de um assistente de IA (Claude) como par de programacao, usado para acelerar a escrita e revisao de codigo, enquanto as decisoes de arquitetura e regras de negocio ficaram sob minha responsabilidade.

## Principais casos de uso

Autenticacao do admin (freelancer ou agencia) via JWT. Criacao de projeto de briefing com link unico por token (UUID). Wizard de 12 etapas para o cliente preencher, com auto-save a cada campo. Assinatura digital (canvas ou nome digitado) ao final do processo. Exportacao de PDF profissional com todas as respostas. Dashboard com status do projeto (draft, sent, in_progress, completed).

## Stack

TypeScript, autenticacao JWT, modelagem de dados relacional (usuarios e projetos).

## Status

Em desenvolvimento (MVP).
