# Prospecta — roadmap geral

Este roadmap descreve o produto inteiro, incluindo a camada pública no Cloudflare e a plataforma operacional original na Vercel. Datas serão definidas somente depois de priorização, capacidade e custos serem confirmados.

## Norte do produto

Transformar critérios comerciais em leads B2B reais, rastreáveis e acionáveis para pessoas que vendem serviços no Brasil, reduzindo o tempo entre a definição do público e o primeiro contato comercial.

## Princípios

- Preservar a interface e os fluxos originais de `captacao-frontend` até existir autorização expressa para redesenho.
- Processar apenas dados empresariais obtidos de fontes autorizadas.
- Aplicar autenticação, isolamento, permissões e consumo no servidor.
- Manter D1 para identidade/planos e Supabase/PostgreSQL para dados operacionais conforme a arquitetura aprovada.
- Não publicar métricas, preços, certificações ou capacidades ainda não comprovadas.
- Não promover uma versão sem testes, smoke test e caminho de rollback.

## Estado atual — fundação publicada

**Status: operacional, com pendências de endurecimento**

- Landing page, imagens próprias, planos conceituais, cadastro e login em `prospectaworbita.site`.
- Usuários, hashes de senha, sessões, planos, validade do trial e consumo armazenados no D1.
- Trial de sete dias, três pesquisas e até cinco resultados por pesquisa, aplicado no servidor.
- Cadastro, login, logout, sessão e pesquisa limitada validados em produção.
- Plataforma original preservada em `app.prospectaworbita.site`.
- Ponte de acesso: conta `scale` autenticada no domínio principal recebe acesso à plataforma original.
- Código e documentação versionados nos dois repositórios GitHub.

## Fase 1 — identidade, segurança e operação confiável

**Objetivo:** transformar a fundação atual em um acesso SaaS administrável e recuperável.

**Status:** implementação e migração D1 concluídas; homologação do remetente, deploy e validação ponta a ponta em produção pendentes.

- Confirmar em navegador o redirecionamento completo da conta proprietária `scale`.
- Implementar verificação de e-mail, recuperação e troca de senha.
- Criar revogação de todas as sessões e painel administrativo mínimo de usuários.
- Criar o papel administrativo auditável para `eduardonunesdrops@gmail.com`, sem manipulação direta de senha.
- Homologar `acesso@prospectaworbita.site` com SPF, DKIM e DMARC em um provedor transacional.
- Definir estados de conta: ativa, suspensa, cancelada e pendente de verificação.
- Aplicar proteção de origem, rate limiting e bot protection em cadastro e login.
- Centralizar políticas de plano e remover permissões visuais desconectadas do servidor.
- Adicionar termos, privacidade, consentimento, exclusão e retenção de dados.
- Criar logs estruturados, alertas essenciais, identificação de release e runbook de incidente.
- Testar backup e recuperação de D1 e Supabase.

**Saída:** o proprietário consegue administrar acessos sem SQL manual; o usuário consegue recuperar sua conta; abuso e falhas críticas são observáveis.

## Fase 2 — permissões e oferta comercial

**Objetivo:** fazer a plataforma aplicar uma única matriz de planos em todas as APIs e telas.

- Formalizar tributos, cancelamento e demais termos comerciais.
- Essential: R$ 49,90/mês, 15 leads/dia e um WhatsApp conectado.
- Growth: R$ 97,90/mês, 45 leads/dia e três WhatsApps conectados.
- Scale: limites, integrações e WhatsApps definidos com o time comercial.
- Criar política central de entitlements e quotas diárias, com reset às 00:00 em `America/Sao_Paulo`.
- Aplicar limites nas APIs de busca, salvamento, campanhas, exportações e integrações.
- Exibir uso, saldo, motivo do bloqueio e próximo passo em todas as áreas relevantes.
- Criar testes de permissão para cada plano.

**Saída:** alterar o plano no painel administrativo muda imediatamente os limites reais do usuário, sem edição manual de código ou SQL.

## Fase 3 — experiência gratuita com dados reais

**Objetivo:** permitir que um potencial cliente entenda o valor sem liberar operação irrestrita.

- Selecionar e homologar uma fonte real autorizada para o trial.
- Limitar o trial a sete dias e no máximo 15 leads em todo o período.
- Melhorar estados vazios, mensagens de erro e sugestões de pesquisa.
- Permitir salvar os leads liberados e executar disparos somente para essa amostra.
- Permitir um WhatsApp conectado no trial.
- Exigir confirmação manual antes de cada campanha do trial.
- Criar onboarding guiado e explicação dos resultados/score.
- Instrumentar ativação, primeira pesquisa e limite atingido sem inventar métricas.
- Definir chamada comercial após o limite, sem bloquear a experiência antes da primeira entrega de valor.

**Saída:** um novo usuário cadastra-se, executa uma consulta com resultados compreensíveis e entende o próximo passo.

## Fase 4 — unificação funcional controlada

**Objetivo:** ligar identidade, planos e permissões às funcionalidades reais da plataforma original.

- Inventariar todas as telas e APIs de `captacao-frontend`.
- Preservar Busca Google, Base privada, Histórico, Listas, Funil, Conversas, WhatsApp, Campanhas e Automações.
- Mapear cada ação desses módulos para `trial`, `essential`, `growth` ou `scale`.
- Substituir decisões espalhadas por uma política de entitlement única e testada.
- Definir se o acesso por token continuará sendo a fronteira ou será trocado por SSO/sessão compartilhada.
- Garantir isolamento por `cliente_id` em buscas, históricos, listas, funil e conversas.
- Exibir uso e limites reais na plataforma original sem alterar sua identidade visual.

**Saída:** cada plano libera exatamente o que foi prometido, com bloqueio no servidor e interface coerente.

## Fase 5 — dados e prospecção em produção

**Objetivo:** entregar busca e organização de prospects com origem, qualidade e custos controlados.

- Homologar Google Places, base privada e outras fontes autorizadas.
- Definir modelo canônico de empresa, contato, evidência e origem.
- Versionar workflows n8n e seus contratos de entrada/saída.
- Implementar idempotência, timeout, tentativas limitadas e fila de falhas.
- Normalizar, validar e deduplicar antes de persistir.
- Registrar procedência, data de coleta e base legal aplicável.
- Manter a base privada estritamente somente leitura e fora de qualquer migração do SaaS.
- Definir retenção de resultados temporários e listas permanentes.
- Monitorar custo e quota por fonte, cliente e plano.

**Saída:** todo registro operacional é rastreável a uma fonte autorizada e não vaza entre clientes.

## Fase 6 — disparos responsáveis e campanhas

**Objetivo:** permitir contatos reais com controles de segurança, reputação e conformidade.

- Exibir aviso de responsabilidade e risco de bloqueio do WhatsApp antes da ativação.
- Implementar limites por conta, plano, número, campanha e janela de tempo.
- Adicionar opt-out, lista de bloqueio, deduplicação e prevenção de reenvio abusivo.
- Registrar consentimento operacional, responsável, conteúdo, destinatários e status.
- Criar suspensão automática e administrativa em sinais de abuso.
- Testar falhas e reconexão da Evolution API sem duplicar mensagens.

**Saída:** campanhas são rastreáveis, limitadas e interrompíveis; o produto não depende apenas de um aviso de responsabilidade.

## Fase 7 — cobrança e operação comercial

**Objetivo:** vender e operar o SaaS de forma sustentável.

- Validar público-alvo, problema prioritário e proposta de valor.
- Definir capacidades e preços reais dos três planos.
- Homologar Amplo Pay, emitir checkout e processar webhooks idempotentes.
- Ativar, alterar, suspender e cancelar planos automaticamente.
- Criar organizações, convites, papéis e auditoria.
- Adicionar integrações de CRM, exportação, webhooks e API conforme plano.
- Medir ativação, uso, retenção, suporte e custo de infraestrutura.

**Saída:** cobrança e permissões permanecem sincronizadas e as promessas comerciais correspondem ao produto.

## Fase 8 — consolidação em VPS

- Definir arquitetura da VPS Ubuntu e ambientes de homologação/produção.
- Projetar PostgreSQL próprio para usuários, leads salvos, campanhas e auditoria.
- Manter a base privada em sua origem e somente leitura.
- Criar backups externos, restauração testada, gestão de segredos e observabilidade.
- Implantar CI/CD, migração progressiva e rollback antes de cortar Cloudflare/Vercel/Supabase.

## Fase 9 — inteligência e escala

- Pesquisa assistida com evidências citadas e revisão humana.
- ICP configurável, score explicável e recomendações rastreáveis.
- Feedback sobre qualidade sem alterar silenciosamente dados do cliente.
- Filas, cache, failover de provedores e orçamentos de consumo.
- SLOs medidos, testes de recuperação e resposta formal a incidentes.

## Próximas decisões do proprietário

1. Escolher a fonte real disponível no trial.
2. Definir os detalhes de permissões por módulo para Essential e Growth além dos limites de leads/WhatsApp.
3. Concluir a homologação do Resend para `acesso@prospectaworbita.site` e validar SPF, DKIM e DMARC.
4. Validar o painel administrativo da Fase 1 e construir os testes de entitlement da Fase 2 antes da cobrança.
5. Formalizar termos comerciais e política de cancelamento antes de integrar a Amplo Pay.

## Não afirmado como pronto

- Entrega de e-mail e fluxos completos da Fase 1 em produção até a homologação do remetente e o smoke test.
- Preços validados, cobrança e assinaturas.
- Política final de permissões para Essential e Growth.
- Escala, receita, conversão, retenção ou SLA comprovados.
