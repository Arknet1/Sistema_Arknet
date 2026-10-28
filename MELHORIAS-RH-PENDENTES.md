# Melhorias de RH identificadas

Revisão complementar feita durante o redesign das páginas RH, em 28/10/2026. A interface e os endpoints foram inspeccionados; não foram alterados modelos nem dados de produção.

## Já corrigido nesta etapa

- O perfil mostrava o responsável directo a partir de `employee.supervisor`, embora a API devolva `directSupervisor`.
- O separador de acesso procurava `employee.user`, enquanto a API devolve `userRef`, fazendo contas existentes parecerem inexistentes. A associação e o estado real da conta são agora apresentados.
- O vencimento no perfil vinha de `employee.baseSalary`, campo inexistente em `HrEmployee`; passa agora a vir do contrato activo.
- A ficha tinha endpoint `PUT` para edição, mas não oferecia acção de edição no perfil. Foi acrescentado formulário com validação e gravação pela API existente.
- Utilizadores sem permissão de dados sensíveis podiam receber `baseSalary` e `salary` em registos de contrato/histórico aninhados na resposta do perfil. Os campos são agora removidos também nesses registos. Dados já mascarados deixaram de apresentar um controlo de revelar sem efeito.
- Tabelas partilhadas e tabelas operacionais feitas à medida tinham tratamentos visuais diferentes. A tabela partilhada recebeu cabeçalho, espaçamento, foco por teclado e skeleton; tabelas próprias de salários, desempenho, folhas de ponto e recrutamento receberam o mesmo tratamento visual.

## O que falta e recomendação

### Prioridade alta — completar a visão 360° do perfil

- O perfil reúne dados pessoais, contratos, documentos, carreira e acesso ao portal, mas não apresenta ali o saldo/histórico de ausências, assiduidade, recibos, avaliações, cursos e certificações. Parte destas áreas já existe noutros módulos e há modelos para ausências, ponto, salários, desempenho e certificações; devem ser ligados ao perfil com permissões próprias.
- A ficha não tem contacto de emergência, dependentes, habilitações, dados de saúde ocupacional ou preferências de comunicação. Estes campos não estão no modelo `HrEmployee`; requerem definição de acesso, retenção e uma alteração aditiva ao modelo antes de serem recolhidos.
- O colaborador não tem fotografia de perfil nem linha temporal única com alterações de dados, contratos, documentos, ausências e avaliações. A linha temporal deve usar auditoria já existente e ocultar detalhes sensíveis conforme o perfil.

### Prioridade média — tabelas para gestão diária

- `HrTable` não inclui ordenação interactiva, selecção múltipla, acções em lote, escolha de colunas ou controlo de itens por página. Algumas páginas implementam paginação/filtros por conta própria; a experiência varia entre módulos.
- A exportação não é uma acção uniforme entre listagens. Recomenda-se CSV/Excel em listas operacionais e PDF para relatórios/recibos, com permissões e filtros aplicados iguais aos da tela.
- Algumas tabelas feitas à medida (salários, desempenho, folhas de ponto e recrutamento) ainda devem ser avaliadas individualmente para ordenação, densidade, comportamento móvel e mensagens de erro/estado vazio. O tratamento visual foi uniformizado nesta etapa, mas a lógica específica foi preservada.

### Prioridade baixa — processos e autosserviço

- Não existe um checklist de integração/saída com responsáveis, prazos, equipamento e confirmação de entrega. É uma função nova e precisa de definir o fluxo com RH/gestores.
- O perfil não permite ao próprio colaborador pedir correcção de dados com aprovação do RH; a alteração actual é administrativa. Uma proposta de alteração pendente evita editar directamente dados legais/bancários e cria trilho de auditoria.
- A navegação e indicadores podem crescer para analytics de retenção, absentismo e recrutamento, mas só após definir períodos, filtros e qualidade de dados para não sugerir métricas enganosas.

## Próxima sequência sugerida

1. Ligar ausências, assiduidade, formação/certificações e recibos ao perfil, reutilizando endpoints e regras de acesso existentes.
2. Uniformizar comportamento de tabelas (ordenação, paginação, exportação e filtros) por componente partilhado.
3. Especificar e aprovar os campos novos de perfil antes de qualquer migração aditiva.
4. Acrescentar integração/saída e pedidos de alteração de dados após validar o fluxo com RH.
