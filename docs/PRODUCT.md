# Prospecta Worbita — definição do produto

## Visão

Prospecta Worbita será um SaaS comercial brasileiro para pessoas e empresas que desejam encontrar potenciais clientes e realizar disparos automáticos para vender seus próprios serviços.

## Proposta de valor

Economizar tempo na prospecção ao permitir que o usuário selecione localização, área de atuação, segmento e informações desejadas, encontre leads correspondentes, salve os resultados e execute contatos controlados dentro da mesma plataforma.

## Público inicial

- Pessoas e pequenas empresas que vendem serviços.
- Operações que precisam prospectar clientes no Brasil.
- Contas individuais como modelo padrão.
- Demandas enterprise, equipes, múltiplos usuários e limites personalizados são tratadas pelo time comercial.

## Marca e experiência

- Nome oficial: **Prospecta Worbita**.
- A plataforma original `captacao-frontend` é a referência visual e funcional.
- Landing page, acesso e futuras telas administrativas devem conversar com essa identidade sem substituir ou descaracterizar a interface original.
- Todos os módulos atuais serão preservados; o usuário filtra e utiliza apenas o que precisa e o plano determina limites e permissões.

## Módulos do produto

- Busca Google.
- Consulta à base privada.
- Histórico de buscas.
- Listas e leads salvos.
- Funil comercial.
- Conversas.
- Vinculação de WhatsApp.
- Campanhas e disparos.
- Automações.
- Administração de usuários, planos, acessos e consumo.

## Fontes e campos

- O produto deverá trabalhar com dados reais dentro de limites por plano.
- Os campos retornados dependem da fonte e dos filtros escolhidos pelo cliente.
- A interface deve informar disponibilidade e procedência, sem prometer campos inexistentes.
- A base privada pertence ao proprietário do produto e é intocável: somente leitura, sem migração, atualização, exclusão ou alteração de esquema.
- Leads salvos, contas, campanhas e demais dados próprios do SaaS podem usar o armazenamento mais adequado à fase atual.

## Oferta comercial inicial

| Plano | Preço | Leads | WhatsApps | Observações |
| --- | ---: | ---: | ---: | --- |
| Teste grátis | R$ 0 | até 15 no período de teste | a confirmar | Pode consultar dados reais, salvar e realizar disparos dentro do limite e dos controles de segurança |
| Essential | R$ 49,90 | 15 por dia | 1 | Conta individual |
| Growth | R$ 97,90 | 45 por dia | 3 | Conta individual com maior capacidade operacional |
| Scale | Sob consulta | Personalizado | Personalizado | Demanda analisada pelo time comercial; pode incluir solução enterprise |

Os preços de Essential e Growth estão registrados como oferta inicial. Periodicidade, tributos, política de cancelamento e detalhes comerciais ainda precisam ser formalizados antes da cobrança.

## Cadastro e administração

- Cadastro individual com verificação de e-mail.
- Login, logout, recuperação e troca de senha.
- Painel administrativo para pesquisar usuários, visualizar consumo, alterar plano, suspender/reactivar conta, revogar sessões e acompanhar integrações.
- Nenhum operador administrativo deve visualizar senhas, hashes ou salts.
- Mudanças administrativas relevantes devem gerar auditoria.

## Disparos e responsabilidade

A plataforma exibirá aviso claro de que o cliente é responsável pelas campanhas e de que envios abusivos podem provocar bloqueio do número de WhatsApp. Além do aviso, o produto deverá implementar:

- limites por plano e por período;
- aquecimento e cadência controlada;
- bloqueio de duplicidade e repetição excessiva;
- lista de bloqueio e opt-out;
- identificação e auditoria da campanha;
- prevenção de abuso e suspensão administrativa;
- orientação de LGPD e termos de uso;
- confirmação explícita antes de iniciar disparos reais.

## Pagamentos

- Provedor pretendido: Amplo Pay.
- Integração será executada posteriormente.
- Até a documentação técnica e o ambiente de testes serem homologados, pagamento e ativação automática permanecem como planejados, não implementados.

## Infraestrutura

### Atual

- Cloudflare Workers + D1: landing, identidade, sessões, planos, trial e consumo.
- Vercel: plataforma operacional original.
- Supabase: dados operacionais utilizados pela plataforma original.
- n8n: orquestração e integrações.
- PostgreSQL privado: fonte empresarial somente leitura.

### Destino

Consolidar gradualmente a aplicação em uma VPS Ubuntu com PostgreSQL próprio e self-hosted, mantendo a base privada separada e intocada. A migração só deve ocorrer após desenho de backup, recuperação, segurança, observabilidade, implantação e rollback.

## Estratégia de repositórios

O GitHub público deve demonstrar engenharia real e profissional sem expor credenciais, dados privados, mecanismos sensíveis ou workflows proprietários. A apresentação pública pode permanecer aberta; o núcleo operacional completo pode tornar-se privado após decisão explícita do proprietário.

## Estado de entrega

Já existe um produto funcional que pode ser demonstrado enquanto novas capacidades são implementadas incrementalmente. O roadmap prioriza confiabilidade de contas e permissões, trial real controlado, administração, integração completa dos planos, segurança dos disparos, cobrança e somente depois consolidação de infraestrutura.
