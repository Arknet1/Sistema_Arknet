# Prontidão Móvel (Mobile Readiness) — J.Matos RH & Portal

Este documento descreve a arquitectura e as decisões técnicas tomadas na implementação do módulo de Recursos Humanos da **J.Matos Tecnologia, Lda.**, garantindo uma transição natural para uma aplicação móvel dedicada (PWA, Capacitor ou React Native).

---

## 1. Princípio Fundamental de Arquitectura

A interface do RH foi construída sob o princípio de **desacoplamento total entre obtenção de dados e apresentação**:

```
┌──────────────────────────────────────────────┐
│             Camada de Apresentação           │
│  (React / Next.js Client Components / Mobile)│
│  - HrTable / HrCardList                     │
│  - HrBottomNav / HrAppBar                   │
│  - HrDialog / HrDrawer                      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│           Cliente de Dados Isolado           │
│         (src/lib/hr/queries/index.ts)        │
│  - hrQuery.getEmployees()                    │
│  - hrQuery.getPortalData()                   │
│  - hrMutation.changePassword()               │
└──────────────────────┬───────────────────────┘
                       │  HTTP / JSON (REST)
                       ▼
┌──────────────────────────────────────────────┐
│             API REST Padronizada             │
│            (/api/rh/*, /api/portal/*)        │
│  - Autenticação por Cookie/Token             │
│  - Controlo RBAC no Servidor                 │
│  - Códigos de estado HTTP semânticos         │
└──────────────────────────────────────────────┘
```

Nenhum ecrã depende de detalhe específico do servidor Next.js (como Server Actions vinculadas a contexto de servidor ou rendering acoplado). Toda a comunicação é feita através de chamadas assíncronas JSON.

---

## 2. Padrões de Experiência Móvel (UX/UI Mobile-First)

### 2.1 Resolução e Áreas de Toque
- **Viewport base:** Otimizado prioritariamente para **390px** (iPhone 12/13/14/15/16 e padrão Android comum).
- **Alvos de toque (Touch Targets):** Mínimo de 44×44px em botões, abas e itens interativos, garantindo ergonomia táctil.
- **Evitamento de scroll horizontal acidental:** Controlo rígido de `overflow-x-hidden` no contentor e tabelas com alternativa em cartões.

### 2.2 Transformação Tabela → Cartões (`HrCardList`)
Em ecrãs inferiores a 640px (`sm:hidden`), todas as tabelas de dados (colaboradores, contratos, documentos, auditoria) são automaticamente substituídas pelo componente `HrCardList`, apresentando:
- Identificação principal e avatar com iniciais.
- Metadados essenciais em linhas compactas com tipografia hierarquizada.
- Ações imediatas (descarregar documento, ver detalhes) ao alcance do polegar.

### 2.3 Navegação Móvel Especializada
- **Portal do Colaborador:** Utiliza `HrBottomNav` fixo no rodapé em ecrãs móveis (Perfil, Documentos, Contrato, Segurança), permitindo alternância com uma mão.
- **Painel de Gestão RH:** Utiliza `HrAppBar` com menu hambúrguer responsivo e gavetas (`HrDrawer`) para filtros em vez de barras de ferramentas extensas.

---

## 3. Preparação para PWA & Empacotamento Nativo

### 3.1 Manifesto PWA
Criado em `public/manifest.webmanifest`:
- Nome: `J.Matos RH`
- Nome curto: `RH J.Matos`
- Cores corporativas configuradas (`theme_color: #0868B0`, `background_color: #F4F6F8`)
- Modo de exibição: `standalone` (sem barra de endereço do navegador quando instalado no ecrã principal).

### 3.2 Roadmap de Migração para Aplicação Móvel Nativa

1. **Fase I (Actual — Web Responsiva & PWA):**
   - Disponível imediatamente no telemóvel através de qualquer navegador móvel em `/rh/entrar` e `/portal`.
   - Adicionável ao ecrã principal como PWA sem instalação por loja.
2. **Fase II (Empacotamento Capacitor / Tauri Mobile):**
   - Encapsular a pasta `out/` ou carregar o domínio corporativo numa WebView com acesso a plugins nativos (notificações push nativas, biometria FaceID/Fingerprint).
3. **Fase III (React Native / Expo):**
   - Reutilizar integralmente o pacote `src/lib/hr/queries/index.ts` e o ficheiro de tokens `src/styles/hr-tokens.json` na aplicação React Native, recriando apenas a casca de componentes nativos (`<View>`, `<Text>`).
