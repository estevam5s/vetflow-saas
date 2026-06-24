# 💸 VetFlow — Planos, Preços e Funcionalidades

> Documento de produto e pricing do **VetFlow** — o sistema de gestão completo para clínicas e
> consultórios veterinários: tutores, pets, agenda, prontuários e financeiro num só lugar.
> Moeda: **BRL (R$)**. Ciclos: **mensal** e **anual (−20%)**.
> Última atualização: 2026-06.

---

## 1) O que é o VetFlow

VetFlow é um SaaS **multi-tenant de gestão veterinária**. Cada clínica tem seu espaço isolado
para cadastrar tutores e pets, agendar consultas, registrar prontuários e controlar o financeiro.

Funcionalidades já existentes (backend NestJS + Prisma, multi-tenant por clínica):
- **Clínicas** (tenant) e **usuários** com papéis (admin, veterinário, recepção)
- **Tutores** (owners) e **Pets** (espécie, raça, peso, nascimento)
- **Consultas/Agenda** (appointments com status)
- **Prontuários** (medical records: anamnese, diagnóstico, tratamento, prescrição)
- **Financeiro** (transações: receitas/despesas)
- **Autenticação JWT** por clínica

Novas funcionalidades adicionadas ao virar SaaS comercial (ver seção 7).

---

## 2) Análise de mercado (resumo)

### 2.1 Categoria e concorrência
VetFlow está no mercado de **software de gestão veterinária (PetTech)**, em forte expansão no
Brasil. Referências de preço praticadas:

| Produto (referência) | Faixa mensal (BRL) | Observação |
|---|---|---|
| Simples Vet | ~R$ 90–250/mês | por clínica, planos por nº de usuários |
| Vetus Gestão | ~R$ 100–300/mês | módulos financeiro/estoque |
| Vetsoft | ~R$ 120–350/mês | foco em clínicas médias/grandes |
| Pawlly / ConsultaVet | R$ 0–150/mês | entrada/freemium |

### 2.2 Posicionamento do VetFlow
- **Gestão veterinária em português**, simples e moderna, para clínicas pequenas e médias.
- Plano de entrada **acessível** (abaixo dos concorrentes tradicionais) com freemium real.
- **Pro** como âncora (multiusuário, financeiro, lembretes, relatórios).
- **Enterprise** para redes de clínicas (multi-unidade, papéis, API, auditoria, SSO).
- **Cobrança por clínica/usuário e por recursos** (pets, usuários, lembretes) — **nunca por GB**.

### 2.3 Conformidade (uso regular)
VetFlow é uma ferramenta de gestão padrão. Dados (tutores/pets/prontuários) pertencem à clínica,
com isolamento multi-tenant (RLS) e auditoria. Em conformidade com a **LGPD** (dados pessoais de
tutores) e boas práticas. Sem práticas enganosas — o valor é **organização, agenda e prontuário
eletrônico** confiáveis.

---

## 3) Os 4 planos

| | **Inicial** | **Starter** | **Pro** ⭐ | **Enterprise** |
|---|---|---|---|---|
| **Preço mensal** | **R$ 0** | **R$ 49/mês** | **R$ 119/mês** | **R$ 299/mês** |
| **Preço anual (−20%)** | R$ 0 | R$ 470/ano (R$ 39,17/mês) | R$ 1.142/ano (R$ 95,17/mês) | R$ 2.870/ano (R$ 239,17/mês) |
| **Para quem** | Testar / autônomo | Consultório | Clínica | Rede de clínicas |
| **Usuários da equipe** | 1 | 3 | 10 | Ilimitados |
| **Tutores e pets cadastrados** | 50 pets | 500 pets | Ilimitados | Ilimitados |
| **Agenda de consultas** | ✅ | ✅ | ✅ | ✅ |
| **Prontuário eletrônico** | Básico | ✅ | ✅ | ✅ |
| **Histórico clínico do pet** | 30 dias | Completo | Completo | Completo |
| **Lembretes (consulta/vacina)** | — | E-mail | E-mail + WhatsApp | E-mail + WhatsApp |
| **Módulo financeiro** | — | Básico | Completo | Completo |
| **Relatórios e métricas** | — | Básico | Avançado | Avançado + exportação |
| **Múltiplas unidades** | — | — | 1 | Ilimitadas |
| **Papéis e permissões** | — | Básico | Completo | Avançado |
| **API + integrações** | — | — | ✅ | ✅ |
| **SSO / auditoria completa** | — | — | — | ✅ |
| **Suporte** | Comunidade | E-mail | Prioritário | Dedicado (SLA) |

⭐ **Pro é o plano em destaque.**

---

## 4) Detalhe por plano

### 🆓 Inicial (Grátis) — R$ 0
- 1 usuário
- Até 50 pets
- Agenda de consultas
- Prontuário básico
- Histórico de 30 dias
- Suporte da comunidade

### 🚀 Starter — R$ 49/mês (R$ 470/ano)
- Até 3 usuários
- Até 500 pets
- Prontuário eletrônico completo
- Histórico clínico completo
- Lembretes por e-mail
- Módulo financeiro básico
- Relatórios básicos
- Suporte por e-mail

### ⭐ Pro — R$ 119/mês (R$ 1.142/ano) — DESTAQUE
- Até 10 usuários
- Pets **ilimitados**
- Lembretes por **e-mail + WhatsApp**
- Módulo financeiro completo
- Relatórios avançados
- 1 unidade (clínica) + papéis e permissões
- **API + integrações**
- Suporte prioritário

### 🏢 Enterprise — R$ 299/mês (R$ 2.870/ano)
- Usuários **ilimitados**
- **Múltiplas unidades** (rede de clínicas)
- Papéis e permissões avançados
- **SSO** e **auditoria completa**
- Exportação de relatórios
- Integrações personalizadas
- Suporte **dedicado com SLA**

---

## 5) Trial, downgrade e reembolso

- **7 dias grátis**: toda conta nova começa com **acesso completo nível Pro** por 7 dias, sem cartão.
- **Após o trial**: sem plano pago, a conta passa para **Inicial** e os recursos/rotas são
  **reduzidos** (gating por plano).
- **Reembolso de 7 dias**: em qualquer plano pago, há **7 dias** após a 1ª cobrança para
  reembolso integral (`refund_eligible_until`).
- **Cancelamento**: a qualquer momento pelo portal Stripe; acesso mantido até o fim do período pago.

---

## 6) Ciclo anual

| Plano | Mensal × 12 | Anual (−20%) | Economia |
|---|---|---|---|
| Starter | R$ 588 | **R$ 470** | R$ 118 |
| Pro | R$ 1.428 | **R$ 1.142** | R$ 286 |
| Enterprise | R$ 3.588 | **R$ 2.870** | R$ 718 |

---

## 7) Novas funcionalidades ao virar SaaS comercial

- **Site institucional** (landing em PT) com planos e proposta de valor.
- **Contas e cadastro** (Supabase Auth) com perfil, plano e trial de 7 dias.
- **Assinaturas Stripe** (checkout, portal, webhook, reembolso 7d).
- **Gating por plano** (usuários, pets, lembretes, financeiro, unidades, API).
- **Dashboard web** de gestão (tutores, pets, agenda) — antes só havia API.
- **Painel administrativo** (usuários, assinaturas, receita).
- **Isolamento por clínica** (RLS) e auditoria.

---

## 8) Resumo de preços (cola rápida)

```
Inicial     R$ 0
Starter     R$ 49/mês    ·  R$ 470/ano
Pro ⭐      R$ 119/mês   ·  R$ 1.142/ano   (destaque)
Enterprise  R$ 299/mês   ·  R$ 2.870/ano

Trial: 7 dias (nível Pro)  ·  Reembolso: 7 dias  ·  Sem cobrança por GB.
```
