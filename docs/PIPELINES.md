# Prospecta — pipelines do produto e da entrega

Este documento descreve quatro fluxos que precisam permanecer coerentes: acesso, dados comerciais, entrega de software e operação de contas.

## 1. Pipeline de acesso

```text
Visitante
   │
   ├── cadastro/login em prospectaworbita.site
   │       │
   │       ▼
   │   Cloudflare Worker ── D1 users/sessions/plans/usage
   │       │
   │       ├── trial ───────► até 15 leads no período
   │       ├── essential ───► 15 leads/dia + 1 WhatsApp
   │       ├── growth ──────► 45 leads/dia + 3 WhatsApps
   │       └── scale ───────► limites comerciais + ponte autenticada
   │                                          │
   │                                          ▼
   └────────────────────────────── app.prospectaworbita.site
                                              │
                                              ▼
                              plataforma original + Supabase + n8n
```

### Controles obrigatórios

- Senha é transformada em hash PBKDF2 no Worker; valor original nunca é armazenado.
- Cookie de sessão é seguro, HTTP-only e validado no servidor.
- D1 decide plano, validade e consumo.
- A ponte só aceita sessão válida e plano autorizado.
- O token operacional é aleatório, revogável e não deve aparecer em logs.
- O navegador nunca escolhe `cliente_id` nem recebe credenciais de D1, Supabase ou n8n.

## 2. Pipeline de dados comerciais

```text
Critérios do usuário + identidade do cliente
                  │
                  ▼
Validação da API ── entitlement ── quota ── correlation ID
                  │
                  ▼
n8n ── fonte autorizada ── timeout ── tentativas limitadas
                  │
                  ▼
Normalização ── validação ── deduplicação ── procedência
                  │
                  ▼
Supabase/PostgreSQL operacional ── histórico ── listas ── auditoria
                  │
                  ▼
Interface original ── seleção ── CSV/webhook/CRM conforme plano
```

### Fronteira atual

| Componente | Situação atual | Próxima evolução |
| --- | --- | --- |
| Trial Cloudflare | Dataset sintético determinístico | Fonte real autorizada, com máximo de 15 leads por trial |
| Busca Google original | Implementação existente via n8n | Homologar quotas, custos, retenção e falhas |
| Base privada original | Implementação existente, somente leitura | Auditar contrato, isolamento e procedência |
| Identidade e plano | D1 | Administração, recuperação e verificação de e-mail |
| Dados operacionais | Supabase e integrações existentes | Formalizar modelo canônico, backup e retenção |
| Automação | n8n | Versionamento, testes, idempotência e observabilidade |

### Regras de processamento

- Cada trabalho carrega cliente, propósito, correlação e idempotência.
- Falhas permanentes de validação não entram em repetição automática.
- Respostas de provedores são normalizadas antes de chegar à interface.
- Campos persistidos conservam origem e data de coleta.
- Exportações e integrações geram eventos auditáveis.
- Dados temporários e permanentes têm políticas de retenção diferentes.

## 3. Pipeline de contas e permissões

```text
Cadastro ── validação ── hash/salt ── usuário trial ── sessão
   │
   ▼
Verificação futura de e-mail
   │
   ▼
Política central de plano ── funcionalidade ── limite ── uso
   │
   ├── permitido ── executa ── registra evento
   └── bloqueado ── motivo claro ── próximo passo comercial
```

Nenhuma permissão deve existir apenas como botão habilitado. A API precisa aplicar a mesma decisão. Alterações manuais por SQL são medidas emergenciais, não o processo administrativo definitivo.

### Matriz inicial

| Operação | Trial | Essential | Growth | Scale |
| --- | --- | --- | --- | --- |
| Leads | 15 no período | 15/dia | 45/dia | Contratado |
| Salvar leads | Dentro do limite | Sim | Sim | Contratado |
| Disparar | Para leads liberados, com controles | Sim | Sim | Contratado |
| WhatsApps | A confirmar | 1 | 3 | Contratado |
| Módulos | Demonstração controlada | Todos, sujeitos a limite | Todos, sujeitos a limite | Definido comercialmente |

O limite deve ser consumido por lead entregue/salvo conforme regra de negócio aprovada, e não apenas por quantidade de cliques ou requisições técnicas. O reset diário precisa usar um fuso horário definido e ser idempotente.

## 4. Pipeline de campanha e disparo

```text
Leads autorizados/salvos
        │
        ▼
Seleção ── deduplicação ── opt-out/bloqueio ── limite do plano
        │
        ▼
Confirmação + aviso de responsabilidade
        │
        ▼
Fila/cadência ── WhatsApp conectado ── Evolution API
        │
        ▼
status por destinatário ── auditoria ── histórico ── interrupção
```

Um aviso sobre spam é obrigatório, mas não libera envio irrestrito. O backend deve controlar cadência, duplicidade, opt-out, suspensão e consumo mesmo que a interface seja manipulada.

## 5. Pipeline de desenvolvimento e publicação

```text
Roadmap/issue aprovado
        │
        ▼
Escolha do repositório responsável
        │
        ▼
Mudança pequena ── revisão de segurança/dados ── documentação
        │
        ▼
typecheck/lint ── testes ── build ── verificação de segredos
        │
        ├── Cloudflare repo ── Worker preview/deploy ── smoke test
        │
        └── Vercel repo ───── deployment ───────────── regressão da UI original
        │
        ▼
domínio real ── autenticação ── permissão ── consulta ── logs
        │
        ├── saudável ── registra versão e evidência
        └── falha ───── rollback e investigação
```

### Gates mínimos

1. Instalação limpa das dependências funciona.
2. Tipagem/lint, testes relevantes e build passam.
3. Nenhum segredo, hash, dado de cliente ou workflow privado entra no commit público.
4. Migração é versionada e revisada antes de ser aplicada remotamente.
5. Mudança de permissão possui teste de permitido e bloqueado.
6. A UI original é comparada antes/depois quando `captacao-frontend` muda.
7. O fluxo afetado é testado no domínio de produção após publicação autorizada.
8. Existe rollback conhecido para Worker, Vercel e banco.

## Responsabilidade por artefato

| Assunto | Fonte de verdade |
| --- | --- |
| Orientação para agentes | `AGENTS.md` |
| Sequência do produto | `docs/ROADMAP.md` |
| Fluxos e gates | `docs/PIPELINES.md` |
| Limites técnicos e de dados | `docs/ARCHITECTURE.md` |
| Configuração Cloudflare | `wrangler.jsonc` |
| Evolução do D1 | `migrations/` |
| Plataforma completa | repositório `captacao-frontend` |
| Publicação e rollback | `docs/DEPLOYMENT.md` |

## Smoke test de produção

Após uma publicação autorizada, verificar nesta ordem:

1. Home e imagens carregam em `prospectaworbita.site`.
2. Cadastro cria uma conta trial sem travar.
3. Sessão é restaurada e uma pesquisa devolve no máximo cinco resultados.
4. Consumo passa de três para dois e permanece após novo login.
5. Trial não abre a plataforma completa.
6. Conta `scale` recebe a ponte e chega ao dashboard original.
7. As páginas, fontes, cores e navegação originais permanecem intactas.
8. Logs não contêm senha, token, hash, salt ou dados desnecessários.
