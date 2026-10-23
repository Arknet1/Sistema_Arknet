# Sistema de Design J.Matos — Recursos Humanos

Este documento detalha o sistema de design corporativo desenvolvido para o módulo de **Recursos Humanos (RH)** e **Portal do Colaborador** da **J.Matos Tecnologia, Lda.**

---

## 1. Princípios de Design & Identidade

1. **Identidade Própria J.Matos:** O módulo de Recursos Humanos pertence exclusivamente à J.Matos Tecnologia e não à ARKNET (a loja online). Toda e qualquer menção, logotipo, paleta ou estilos da loja estão completamente isolados deste módulo.
2. **Tema Claro e Corporativo:** Interface 100% em tema claro (*light theme*), sem gradientes artificiais, sem sombras excessivas, transmitindo seriedade institucional e legibilidade.
3. **Mobile-First:** Todos os ecrãs são concebidos em primeiro lugar para telemóvel (390px), expandindo harmoniosamente para tablet (768px) e desktop (1366px+).
4. **Isolamento de Estilos:** Os estilos residem em `src/styles/hr-tokens.json` e são compilados para `src/styles/hr-theme.css`. A rota `(hr)` possui o seu próprio layout raiz (`<html>` e `<body>`), sem herdar CSS global nem componentes da loja.

---

## 2. Tokens de Cor & Aplicação

| Token | Variável CSS | Valor Hex | Finalidade |
|---|---|---|---|
| **Primary** | `--hr-primary` | `#0868B0` | Ações principais, botões, links activos, ícones de destaque |
| **Primary Hover** | `--hr-primary-hover` | `#06528D` | Estado hover de botões primários |
| **Primary Soft** | `--hr-primary-soft` | `#E8F2FA` | Fundo de itens selecionados, chips subtis |
| **Orange Accent** | `--hr-accent-orange` | `#F09000` | **Estritamente reservado:** linha decorativa de 2px no topo e elemento do logotipo J.Matos. Proibido em botões ou texto. |
| **Background** | `--hr-bg` | `#F4F6F8` | Fundo global da aplicação RH |
| **Surface** | `--hr-surface` | `#FFFFFF` | Fundo de cartões, tabelas, modais, gavetas e menus |
| **Surface Muted** | `--hr-surface-muted` | `#F8FAFC` | Cabeçalhos de tabelas, áreas secundárias |
| **Border** | `--hr-border` | `#E2E8F0` | Divisórias principais, contorno de inputs e cartões |
| **Border Subtle** | `--hr-border-subtle` | `#EDF2F7` | Separadores internos de listas e campos |
| **Text Primary** | `--hr-text` | `#1A202C` | Títulos, valores principais e texto de leitura |
| **Text Muted** | `--hr-text-muted` | `#4A5568` | Rótulos, descrições secundárias, metadados |
| **Text Light** | `--hr-text-light` | `#718096` | Placeholders e notas de rodapé |
| **Success** | `--hr-status-success` | `#059669` | Estados activos, em dia, contratos válidos |
| **Success BG** | `--hr-status-success-bg` | `#ECFDF5` | Fundo de badges de sucesso |
| **Warning** | `--hr-status-warning` | `#D97706` | Prazos a expirar (< 30 dias), avisos de acção |
| **Warning BG** | `--hr-status-warning-bg` | `#FFFBEB` | Fundo de badges de aviso |
| **Error** | `--hr-status-error` | `#DC2626` | Documentos expirados, colaboradores desligados, erros |
| **Error BG** | `--hr-status-error-bg` | `#FEF2F2` | Fundo de badges de erro e alertas de formulário |

---

## 3. Tipografia

- **Família Tipográfica:** `Source Sans 3` (Google Fonts), carregada especificamente no layout `src/app/(hr)/layout.tsx`.
- **Escala:**
  - `h1`: 24px (1.5rem), peso 700, entrelinha 1.25
  - `h2`: 20px (1.25rem), peso 700, entrelinha 1.3
  - `h3`: 16px (1rem), peso 600, entrelinha 1.4
  - `body`: 14px (0.875rem), peso 400, entrelinha 1.5
  - `caption / small`: 12px (0.75rem), peso 400 ou 500, entrelinha 1.4
  - `monospace / data`: Font mono nativa para NIF, BI, IBAN, códigos `JM-001`.

---

## 4. Biblioteca de Componentes (`src/components/hr/`)

Todos os componentes são modulares, sem dependência de bibliotecas de componentes externas:

1. **`HrLogo` (`hr-logo.tsx`)**: Renderiza a marca oficial da J.Matos com tamanhos `sm`, `md` e `lg`, respeitando a proporção da imagem sem distorção.
2. **`HrButton` (`hr-button.tsx`)**: Botões acessíveis com variantes `primary`, `secondary`, `outline`, `ghost`, `danger`. Suporta `isLoading`, ícones à esquerda/direita e largura total (`fullWidth`).
3. **`HrInput`, `HrSelect`, `HrTextarea`, `HrCheckbox`, `HrField` (`hr-input.tsx`)**: Controlo de formulários com estados de erro, rótulos claros e suporte de ícones.
4. **`HrBadge` (`hr-badge.tsx`)**: Etiquetas de estado (`success`, `warning`, `error`, `info`, `neutral`).
5. **`HrTable` (`hr-table.tsx`)**: Tabela desktop com colunas configuráveis, alinhamento, formatação personalizada e estado de carregamento/vazio.
6. **`HrCardList` (`hr-card-list.tsx`)**: Vista em cartões responsiva para dispositivos móveis, adaptando dados tabulares em blocos fáceis de tocar.
7. **`HrTabs` (`hr-tabs.tsx`)**: Navegação por abas com indicador animado e scroll horizontal suave em ecrãs móveis.
8. **`HrDialog` / `HrConfirmDialog` (`hr-dialog.tsx`, `hr-confirm-dialog.tsx`)**: Modais acessíveis com bloqueio de scroll de fundo e foco automático.
9. **`HrDrawer` (`hr-drawer.tsx`)**: Gaveta lateral ou inferior para filtros rápidos e detalhes no telemóvel.
10. **`HrAppBar` / `HrBottomNav` (`hr-app-bar.tsx`, `hr-bottom-nav.tsx`)**: Cabeçalho móvel com barra de 2px laranja e barra de navegação inferior com altura tátil de 56px para o portal do funcionário.
11. **`HrSidebar` (`hr-sidebar.tsx`)**: Barra lateral de navegação no desktop com recolhimento e indicação de utilizador activo.
12. **`HrToast` (`hr-toast.tsx`)**: Sistema de notificações não-bloqueantes (`success`, `error`, `info`, `warning`).

---

## 5. Pipeline de Geração de Temas

O ficheiro `src/styles/hr-tokens.json` é a única fonte da verdade para tokens. O script `scripts/generate-hr-theme.mjs` converte este JSON em variáveis CSS em `src/styles/hr-theme.css`.

Para regenerar o CSS após alterar tokens:
```bash
node scripts/generate-hr-theme.mjs
```
