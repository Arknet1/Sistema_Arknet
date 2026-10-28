# Auditoria técnica e funcional — J.Matos RH

**Data:** 28 de Outubro de 2026  
**Âmbito:** Aplicação Next.js completa, com foco no RH, portal do funcionário e infraestrutura partilhada.  
**Fase:** Auditoria anterior a alterações. Nenhum código funcional foi alterado nesta fase.

## 1. Resumo executivo

O repositório contém um portal corporativo/e-commerce e um módulo de RH integrado, não um projecto isolado de RH. O RH tem páginas para gestão de pessoal, contratos, documentos, ponto, ausências, folhas mensais, salários, desempenho, formação e recrutamento; existe ainda um portal autenticado para funcionários. A maior parte da estrutura e dos endpoints está implementada e a compilação de produção é possível.

Há, contudo, riscos que impedem tratar o módulo como pronto para produção sem revisão: segredo cron de fallback conhecido no código; possibilidade de apagar recibos existentes ao reprocessar a folha; cálculo salarial com valores e majorações fixos; validação de admissão insuficiente; pesquisa global que envia um parâmetro que a página não lê; e tendências de dashboard fabricadas. Os cálculos legais devem ser confirmados com a entidade responsável antes de os corrigir, dado o impacto em remunerações e conformidade.

### Execução e qualidade observadas

| Verificação | Resultado |
|---|---|
| `npm run dev` | Arrancou em `http://localhost:3001`; o login `/rh/entrar` renderizou. Não foi feita autenticação nem escrita de dados. |
| `npx tsc --noEmit` | Passou sem erros. |
| `npm run build` | Passou após execução com acesso de rede para descarregar fontes. Avisos descritos na secção 7. |
| `npm test` | Não iniciou os testes: Node 24 lançou `uv_os_get_passwd returned ENOMEM` no arranque de `tsx`. Resultado inconclusivo, não significa que os testes falhem. |
| Linter | Não configurado: não há script `lint` em `package.json` nem `eslint` instalado em `node_modules`. |
| Navegação autenticada | Não auditada em sessão autenticada; não foram usadas credenciais de produção nem alterados dados. |

## 2. Mapa da aplicação

### Páginas do RH e portal

| URL | Página / ficheiro |
|---|---|
| `/rh/entrar` | Login RH — `src/app/(hr)/rh/entrar/page.tsx` |
| `/rh` | Dashboard — `src/app/(hr)/rh/(painel)/page.tsx` |
| `/rh/funcionarios` | Lista/criação — `src/app/(hr)/rh/(painel)/funcionarios/page.tsx` |
| `/rh/funcionarios/[id]` | Perfil e histórico — `src/app/(hr)/rh/(painel)/funcionarios/[id]/page.tsx` |
| `/rh/departamentos`, `/rh/cargos` | Estrutura orgânica — páginas `departamentos/page.tsx`, `cargos/page.tsx` no grupo `(painel)` |
| `/rh/contratos`, `/rh/documentos`, `/rh/auditoria` | Contratos, arquivo documental e trilho de auditoria — páginas homónimas em `(painel)` |
| `/rh/ponto`, `/rh/ausencias` | Ponto e gestão de ausências — páginas homónimas em `(painel)` |
| `/rh/folhas-ponto`, `/rh/salarios` | Fecho mensal de ponto e processamento salarial — páginas homónimas em `(painel)` |
| `/rh/desempenho`, `/rh/recrutamento`, `/rh/configuracao` | Avaliação/formação, ATS e configuração — páginas homónimas em `(painel)` |
| `/portal` | Portal do funcionário — `src/app/(hr)/portal/page.tsx` |

Componentes partilhados do módulo: `src/components/hr/` (sidebar, header, tabela, cartões móveis, campos, diálogos, estados vazios, skeletons e toast). Tema/tokens: `src/styles/hr-theme.css` e `src/styles/hr-tokens.json`. A casca visual tem sidebar, cabeçalho e navegação móvel; pesquisa e notificações não estão completas como experiência integrada.

### Endpoints

O build encontrou os endpoints abaixo, agrupados por domínio (os segmentos dinâmicos aparecem entre parênteses rectos):

- **RH:** `/api/rh/auditoria`, `ausencias`, `ausencias/[id]/decisao`, `ausencias/calendario`, `cargos`, `configuracao`, `configuracao/{feriados,locais,tipos-licenca}`, `contratos`, `departamentos`, `documentos`, `documentos/[id]/download`, `funcionarios`, `funcionarios/[id]`, `funcionarios/[id]/criar-utilizador`, `folhas-ponto`, `folhas-ponto/[code]`, `folhas-ponto/[code]/exportar`, `folhas-ponto/[code]/folha/[timesheetId]`, `formacao/{certificacoes,cursos}`, `notificacoes`, `notificacoes/[id]/ler`, `ponto/{hoje,manual,relatorios,pedidos}`, `ponto/pedidos/{correccoes,horas-extras}/[id]`, `recrutamento/{candidatos,vagas}`, `recrutamento/candidatos/[id]/admitir`, `desempenho/{avaliacoes/[id],ciclos,ciclos/[id]}`, `salarios`, `salarios/[code]`, `salarios/[code]/{ficheiro-banco,mapa-agt,mapa-inss,recibo/[payslipId]}`, e tarefas cron `cron/{alertas,fecho-dia,lembrete-ponto,limpeza-gps}`.
- **Portal:** `/api/portal/{ausencias,ausencias/[id]/cancelar,consentimento-gps,dados,folha-ponto,ponto/{corrigir,historico,hoje,marcar},recibos,recibos/[id]}`.
- **Autenticação/infraestrutura:** `/api/auth/{recovery,session}`, `/api/health`, `/api/db`, além de APIs da loja, uploads, newsletter, eventos, tickets e WhatsApp. O middleware central está em `src/middleware.ts`.

### Modelos/tabelas Prisma

**RH:** `HrDepartment`, `HrPosition`, `HrEmployee`, `HrCareerHistory`, `HrContract`, `HrDocument`, `HrAuditLog`, `HrAlertLog`, `HrConfig`, `HrWorkLocation`, `HrEmployeeWorkLocation`, `HrWorkDay`, `HrTimeEntry`, `HrTimeCorrectionRequest`, `HrLeaveType`, `HrLeaveBalance`, `HrLeaveRequest`, `HrHoliday`, `HrNotification`, `HrTimesheetPeriod`, `HrTimesheet`, `HrTimesheetDayDetail`, `HrTimesheetVersionSnapshot`, `HrPayrollPeriod`, `HrPayslip`, `HrPayslipItem`, `HrPerformanceCycle`, `HrPerformanceReview`, `HrCertification`, `HrTrainingCourse`, `HrJobOpening`, `HrCandidate`.

**Identidade e restantes domínios** (mesmo `prisma/schema.prisma`): `AdminUser`, `Customer`, `ProductCategory`, `Product`, `ProductOption`, `ProductOptionValue`, `ProductVariant`, `ProductVariantOption`, `StoreOrder`, `StoreOrderItem`, `ProductReservation`, `ServiceLead`, `NewsletterSubscriber`, `NewsletterCampaign`, `Event`, `EventRegistration`, `Course`, `Project`, `DailyActivity`, `Partner`, `Testimonial`, `Job`, `JobApplication`, `CompanySetting`, `AuditActivity`, `Ticket`, `TicketNote`, `TicketReply`.

## 3. Problemas encontrados

As linhas abaixo referem-se ao estado do repositório auditado. A classificação mede risco/impacto funcional; os pontos legais e de folha exigem validação especializada.

| Gravidade | Problema e evidência | Ficheiro / linha |
|---|---|---|
| **Crítico** | O endpoint cron aceita um segredo constante embutido no código quando `CRON_SECRET` não está configurado. Como o middleware isenta este endpoint da autenticação normal, a protecção depende deste segredo. Se o fallback chegar a produção, qualquer pessoa que o conheça pode executar o processamento de alertas. O mesmo padrão deve ser verificado nos restantes cron endpoints. | `src/app/api/rh/cron/alertas/route.ts:7`; excepção no `src/middleware.ts:99–101` |
| **Crítico** | A assinatura de sessão também usava uma chave fixa conhecida quando `AUTH_SECRET` faltava; isso permitiria fabricar sessões em produção. Corrigido após a auditoria: o fallback agora só existe em desenvolvimento/testes e produção falha de forma segura sem configuração. | `src/lib/server-auth.ts`; `src/lib/edge-auth.ts` |
| **Alto** | Reprocessar a folha apaga todos os recibos do período (`deleteMany`) e recria-os sem verificar se o período está aprovado/pago ou se o processamento é permitido. Pode destruir histórico de remuneração. Confirmar o ciclo de estados antes de qualquer alteração. | `src/lib/hr/services/payroll-service.ts:190` |
| **Alto** | A folha usa subsídios fixos de 35.000/30.000 Kz para todos e calcula horas extra sempre a 150%, sem escalões/limites aparentes neste trecho. A taxa e incidência podem não corresponder à lei, contrato ou política vigente; risco directo de líquido, imposto e mapas incorrectos. Rever fórmulas e fontes legais antes de parametrizar/corrigir. | `src/lib/hr/services/payroll-service.ts:223–227` |
| **Alto** | Admissão valida presença, unicidade de BI/e-mail, mas não formato de e-mail/BI/IBAN, validade das datas (objecto `Invalid Date` é truthy), data de nascimento futura, admissão coerente, salário inicial negativo/NaN ou identificador de funcionário duplicado. A API converte `initialSalary` directamente em `Prisma.Decimal`. | `src/app/api/rh/funcionarios/route.ts:112–128, 145–148, 203` |
| **Médio** | A pesquisa global do cabeçalho navega para `/rh/funcionarios?busca=...`, mas a página lê a pesquisa de estado local e envia `search`; não consome `busca` da query string. Enter na pesquisa não pré-filtra a lista. | `src/components/hr/hr-header.tsx:122–130`; `src/app/(hr)/rh/(painel)/funcionarios/page.tsx:31–35, 82–87` |
| **Médio** | As sparklines do dashboard usam séries estáticas descritas no próprio código como “mock … visual illustration”; os valores não representam histórico real e podem sugerir tendências inexistentes. | `src/app/(hr)/rh/(painel)/page.tsx:192–194` |
| **Médio** | O dashboard actual apresenta três indicadores (ativos, contratos a vencer e documentos a expirar); faltam cartões de presenças, faltas, férias pendentes e admissões mensais pedidos no objectivo. O layout existente não inclui notificações na topbar. | `src/app/(hr)/rh/(painel)/page.tsx`; `src/components/hr/hr-header.tsx` |
| **Médio** | A gestão de funcionários faz paginação no servidor; a cobertura de filtros/pesquisa é observável na API, mas não foi possível percorrer esses fluxos de UI sem sessão autenticada. Ordenação e exportação geral de funcionários não aparecem implementadas; exportações visíveis estão concentradas em ponto/folha salarial. Confirmar requisitos por página na Fase 2. | `src/app/api/rh/funcionarios/route.ts:20–26, 65–80`; `src/app/(hr)/rh/(painel)/funcionarios/page.tsx` |
| **Médio** | Não há script ou dependência de lint, logo não existe verificação automatizada de lint no projecto. Os testes existentes estão presentes mas ficaram sem execução por erro de ambiente Node (`ENOMEM`) no arranque. | `package.json`; execução de `npm test` |
| **Baixo** | Ao carregar a casca do painel, erros de `fetch('/api/auth/session')` são silenciosamente ignorados; a UI usa temporariamente identidade e e-mail de RH genéricos e não apresenta estado de erro/carregamento para o perfil. | `src/app/(hr)/rh/(painel)/layout.tsx:20–29, 39–41` |
| **Baixo** | O build avisa que a convenção `middleware` está descontinuada no Next.js 16.2.1 e recomenda a convenção `proxy`. Não bloqueia compilação hoje, mas exige migração compatível. | `src/middleware.ts`; aviso do build |
| **Baixo** | O rastreio de output do build acusa que o import de filesystem em `src/lib/hr/storage.ts` via rota de download faz o Next traçar o projecto inteiro. Pode aumentar artefacto e custo de build/deploy. | `src/lib/hr/storage.ts`; trace também envolve `src/app/api/rh/documentos/[id]/download/route.ts` |

### Validação de regras e segurança

- **Autenticação/perfis:** o middleware separa `/admin`, `/rh` e `/portal`; os serviços têm motor RBAC (`src/lib/hr/permissions.ts`) e `getHrServerSession` confirma utilizador activo em `src/lib/hr/server-session.ts`. A validação por endpoint e controlo de acesso a dados sensíveis devem ser revistos rota a rota em testes autenticados; a análise estática não detectou bypass confirmado nos fluxos listados.
- **Segredos:** o fallback cron é o risco confirmado. `.env`/`.env.local` existem no workspace; os seus valores não foram lidos nem incluídos neste relatório. Confirmar que não são versionados e que as chaves de produção são obrigatórias.
- **Dados sensíveis:** a listagem de funcionários mascara dados conforme permissão (`/api/rh/funcionarios`); recibos, IBAN, BI e documentos pedem uma revisão dedicada para garantir que logs, payloads e ficheiros temporários não os expõem.
- **Sanitização:** as APIs usam conversão manual de `request.json()` e validações ad hoc; não foi encontrada uma validação de schema partilhada para as rotas RH. React escapa texto por omissão, mas upload, nomes de ficheiro, conteúdo exportado e entradas numéricas precisam de validação contextual.
- **RH:** faltas e saldo de férias estão implementados; saldo proporcional começa em `src/lib/hr/services/leave-service.ts:88`. A regra proporcional, feriados, arredondamento, sobreposições concorrentes e incidência fiscal não foram recalculados contra fonte legal actual nesta auditoria. Horas extra e salário são o risco confirmado acima.

## 4. Cobertura funcional preliminar

- **Já existe código para:** CRUD de pessoal, departamentos, cargos, contratos, documentos; pedidos/aprovação de ausências; marcação de ponto e geofencing; correcções e horas extra; folha mensal e exportação; processamento salarial, recibos, mapas AGT/INSS e ficheiro bancário; desempenho/formação; vagas/candidaturas e admissão integrada.
- **Incompleto/inconsistente confirmado:** tendências fictícias de dashboard, pesquisa global inoperante, métricas pedidas ausentes e risco de dados apagados no reprocessamento de salários.
- **Botões sem acção / filtros / paginação / exportações:** não declaro outros casos como confirmados sem sessão autenticada. Há oito suites de teste no repositório (auth, RBAC e fases 2–7/payroll/ATS), mas a execução ficou bloqueada pelo runtime nesta máquina.
- **Estados de interface:** existem componentes de skeleton, empty state, dialogs e toast; a aplicação não os usa uniformemente (exemplo: erro de sessão engolido no layout). O mapa de cobertura por ecrã ficará para a verificação funcional autenticada.
- **Acessibilidade e responsividade:** há sidebar móvel, bottom navigation, tabelas substituídas por cartões e alvos de toque declarados nos tokens. Ainda falta validação real por teclado/leitor de ecrã e viewport. Não se confirmou modo escuro.

## 5. Plano de correcção proposto

1. **Segurança e integridade de dados (Crítico/Alto):** exigir segredo cron exclusivamente via ambiente e proteger todos os cron endpoints; tornar reprocessamento salarial idempotente com bloqueio explícito de períodos aprovados/pagos e preservar recibos/auditoria.
2. **Folha e validação (Alto):** mapear regras e fórmulas usadas, validar com responsável de RH/contabilidade, parametrizar valores legítimos e acrescentar schemas partilhados no frontend/backend para BI, e-mail, IBAN, datas, moeda e limites. Não alterar tabelas nem apagar dados.
3. **Fluxos e interface (Médio):** corrigir pesquisa global/query param; substituir tendências fictícias por séries derivadas de dados reais ou remover as tendências; completar indicadores do dashboard e notificações; rever listas, filtros, ordenação, paginação, exportações e feedback de erro.
4. **Sistema visual/acessibilidade:** evoluir tokens existentes para design system coerente, rever sidebar/topbar, tabelas, formulários, perfis, estados de carregamento/vazio/erro, responsividade e navegação por teclado; avaliar modo escuro sem adicionar dependências desnecessárias.
5. **Qualidade e manutenção:** estabilizar execução de testes no ambiente, adicionar lint, resolver avisos Next/font/build trace e validar telas com sessão e por perfis. Registar cada etapa e resultados; sem migrações destrutivas.

## 6. Pressupostos e pendências de auditoria

- Considero “sistema de RH” o módulo `/rh`, `/portal` e APIs/sessões partilhadas; o restante site/e-commerce será preservado e só será alterado se tiver relação directa com autenticação, build ou componentes comuns.
- Não havia sessão de RH autenticada fornecida; fluxos que criam/alteram dados, exportam ou dependem de perfil foram analisados no código, mas não foram submetidos na interface.
- O relatório identifica riscos confirmados e pontos que precisam de validação funcional/legal. Não assume que uma regra de remuneração está errada sem confirmação do responsável e da legislação vigente.

## 7. Avisos do build

Build com sucesso, mas reportou:

1. `middleware` está obsoleto na versão de Next instalada; recomendada migração para `proxy`.
2. `next/font/google` não conseguiu descarregar fontes no ambiente isolado; após autorização de rede o build completou. O uso de fontes remotas torna o build dependente de conectividade.
3. O rastreio NFT do `next.config.ts` reporta um ficheiro inesperado e potencial tracing de todo o repositório, seguindo import por `src/lib/hr/storage.ts` até à rota de download documental.
4. O build gerou 161 páginas/rotas estáticas e dinâmicas; não foram observados erros TypeScript.

## 8. Plano visual da Fase 2 (para aprovação)

Manter a stack (Next.js, React, Tailwind v4, Prisma) e tokens existentes. Ajustar a casca RH para sidebar recolhível e topbar com pesquisa funcional, notificações e menu de utilizador; ampliar dashboard apenas com dados obtidos das APIs; normalizar tabelas e formulários por componentes existentes; melhorar perfil do colaborador, skeletons, estados vazios/erro e foco visível. Validar telemóvel/tablet/desktop e teclado. Activar modo escuro se não exigir uma alteração estrutural pesada.

**Decisão:** o utilizador validou o relatório e o plano, autorizando a Fase 2 e as correcções prioritárias.

## 9. Registo de execução após validação do plano

O utilizador validou o plano em 28 de Outubro de 2026. Foram implementadas as alterações listadas no resumo final do trabalho: protecção cron centralizada sem fallback, bloqueio de reprocessamento que substitua recibos, validação de admissão, pesquisa global, endpoint de métricas do dashboard, notificação funcional, sidebar recolhível, modo escuro e indicadores derivados de dados reais.
