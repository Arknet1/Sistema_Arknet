# Portal ARKNET & Loja Oficial J.Matos Tecnologia

Portal corporativo integrado de telecomunicações, serviços de TI e loja de comércio eletrónico desenvolvido para o mercado angolano.

---

## 📋 Sumário
1. [Visão Geral e Arquitetura](#-visão-geral-e-arquitetura)
2. [Identidades de Marca](#-identidades-de-marca)
3. [Requisitos do Sistema](#-requisitos-do-sistema)
4. [Instalação e Arranque Local](#-instalação-e-arranque-local)
5. [Variáveis de Ambiente](#-variáveis-de-ambiente)
6. [Base de Dados e Migrações (Prisma ORM)](#-base-de-dados-e-migrações-prisma-orm)
7. [Painel de Administração e Credenciais](#-painel-de-administração-e-credenciais)
8. [Configuração de Envio de Emails (SMTP)](#-configuração-de-envio-de-emails-smtp)
9. [Integração e Atendimento WhatsApp](#-integração-e-atendimento-whatsapp)
10. [Procedimento de Deploy em Produção](#-procedimento-de-deploy-em-produção)
11. [Backups e Segurança](#-backups-e-segurança)

---

## 🏛️ Visão Geral e Arquitetura

O sistema foi construído como uma aplicação full-stack moderna utilizando:
- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Base de Dados:** [Prisma ORM](https://www.prisma.io/) com suporte a SQLite local (desenvolvimento/VPS) e PostgreSQL (produção distribuída) + camada de backup JSON síncrono (`data/arknet-db.json`)
- **Estilos:** Tailwind CSS v4 com paletas corporativas personalizadas e animações dinâmicas
- **Autenticação:** Sessões seguras JWT assinadas via HMAC-SHA256 (`EdgeAuth` + `Cookie HttpOnly`) para Administradores e Clientes
- **Email Corporativo:** Nodemailer com suporte a CIDs inline, templates editoriais responsivos e recuperação de palavra-passe
- **Atendimento WhatsApp:** Envio automatizado de pedidos, cotações, faturas e links diretos internacionais (+244)

---

## 🏷️ Identidades de Marca

O portal opera com duas identidades complementares sob a mesma infraestrutura:
1. **ARKNET Angola** (`/`, `/empresa`, `/servicos`, `/projetos`, `/eventos`, `/reclamacoes`):
   - Telecomunicações, Internet Dedicada Empresarial, Cibersegurança, Cloud Corporativo e Infraestruturas de TI.
2. **J.Matos Tecnologia** (`/loja`, `/loja/carrinho`, `/loja/checkout`, newsletters da loja):
   - Divisão e-commerce e retalho de hardware, computadores, servidores, cablagem de fibra e equipamentos de rede do Grupo ARKNET.
   - NIF Oficial de Faturação: **5412398760**
   - Morada: **Rua Directa do Kero, Casa Nº32 R/C, Kilamba, Luanda**

---

## ⚙️ Requisitos do Sistema
- **Node.js:** Versão 20.x LTS ou superior
- **npm:** Versão 10.x ou superior
- **Sistema Operativo:** Windows, Linux (Ubuntu/Debian) ou macOS

---

## 🚀 Instalação e Arranque Local

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Gerar o cliente Prisma:**
   ```bash
   npm run db:generate
   ```

3. **Iniciar a base de dados (se necessário recriar os dados de demonstração):**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Executar em modo de desenvolvimento:**
   - No Windows, clique duas vezes no ficheiro `iniciar.bat` ou execute no PowerShell:
     ```powershell
     .\iniciar.ps1
     ```
   - Ou execute via terminal:
     ```bash
     npm run dev
     ```
   O portal estará disponível em: `http://localhost:3001`

---

## 🔐 Variáveis de Ambiente

Crie um ficheiro `.env` na raiz do projeto baseado no `.env.example`:

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | String de ligação da base de dados | `"file:./dev.db"` (SQLite) ou PostgreSQL |
| `AUTH_SECRET` | Chave de 64 caracteres para assinatura JWT | Gere com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SITE_URL` | URL pública canónica do site | `https://arknet.co.ao` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número oficial internacional WhatsApp | `+244935208449` |
| `SMTP_HOST` | Servidor SMTP para envio de emails | `smtp.gmail.com` ou `smtp.arknet.co.ao` |
| `SMTP_PORT` | Porta SMTP | `587` (TLS) ou `465` (SSL) |
| `SMTP_SECURE` | Utilizar SSL/TLS direto | `true` ou `false` |
| `SMTP_USER` | Utilizador / Email de envio | `arknet40@gmail.com` |
| `SMTP_PASS` | Palavra-passe de aplicação | `sua_senha_de_aplicacao` |
| `SMTP_FROM` | Nome e email no cabeçalho De | `"ARKNET Telecom" <comercial@arknet.co.ao>` |

---

## 🗄️ Base de Dados e Migrações (Prisma ORM)

O Prisma gere os modelos relacionais (`prisma/schema.prisma`):
- `AdminUser`: Administradores e Editores do backoffice
- `Customer`: Clientes com conta pessoal/empresarial
- `Product` & `ProductCategory`: Catálogo, variantes (cores, RAM, armazenamento) e stock
- `StoreOrder` & `StoreOrderItem`: Encomendas, faturas e histórico WhatsApp
- `ProductReservation`: Reservas de equipamentos em trânsito
- `ServiceLead`: Pedidos de cotação e propostas técnicas
- `Event` & `EventRegistration`: Gestão de eventos, workshops e emissão de credenciais digitais
- `Ticket`, `TicketReply` & `TicketNote`: Livro de Reclamações e pedidos de informação
- `CompanySetting`: Contactos oficiais, carrossel e textos institucionais

Comandos úteis:
```bash
npm run db:studio   # Abre a interface visual de gestão da base de dados
npm run db:push     # Sincroniza o esquema com a base de dados
npm run db:seed     # Carrega os dados iniciais a partir de data/arknet-db.json
```

---

## 👤 Painel de Administração e Credenciais

Aceda à área de gestão através de: `/admin` (ou `/login`)

### Contas Pré-configuradas:
- **Administrador Principal:**
  - Email: `admin@arknet.co.ao` ou `admin@arknet.ao`
  - Acesso: Acesso total (Produtos, Encomendas, Relatórios, Backups, Utilizadores, Definições)
- **Editor de Conteúdos:**
  - Email: `editor@arknet.co.ao`
  - Acesso: Gestão de catálogo, eventos e pedidos de contacto

> ⚠️ **IMPORTANTE:** Por motivos de segurança, altere as palavras-passe padrão logo após o primeiro acesso através de `/admin/utilizadores` ou no separador de perfil.

---

## 📧 Configuração de Envio de Emails (SMTP)

O sistema suporta templates HTML profissionais para:
1. **Recuperação de Palavra-passe:** Envio de código de 6 dígitos válido por 15 minutos.
2. **Confirmação de Encomendas & Proformas:** Envio automático ao cliente e notificação à equipa.
3. **Campanhas de Newsletter Editoriais:** Editor visual no `/admin/newsletter` com produtos em destaque e imagens embutidas via CID.
4. **Notificações de Reclamações:** Notificação por email aos administradores e resposta oficial ao reclamante.

---

## 💬 Integração e Atendimento WhatsApp

Todos os fluxos comerciais possuem integração direta com o WhatsApp corporativo (`+244 935 208 449`):
- **Checkout da Loja:** Mensagem pré-formatada contendo número do pedido, lista de equipamentos, variantes e valor total.
- **Simulador de Serviços:** Envio da especificação técnica personalizada diretamente aos engenheiros.
- **Acompanhamento de Encomenda:** Botão direto no perfil do cliente para validação de comprovativos bancários.

---

## 🌐 Procedimento de Deploy em Produção

### Opção A: Servidor VPS Linux / Windows (Recomendado para SQLite + Node.js)
1. Instale o Node.js 20 LTS e o gerenciador PM2:
   ```bash
   npm install -g pm2
   ```
2. Clone o repositório e configure o ficheiro `.env`.
3. Compile o projeto:
   ```bash
   npm run build
   ```
4. Inicie o serviço com PM2:
   ```bash
   pm2 start npm --name "arknet-portal" -- start
   pm2 save
   pm2 startup
   ```
5. Configure um reverse proxy (Nginx, Caddy ou IIS) apontando para a porta `3000` com certificado SSL gratuito (Let's Encrypt / Certbot).

### Opção B: Cloud / Vercel / Railway com PostgreSQL
1. No `.env`, altere o `DATABASE_URL` para a base de dados PostgreSQL remota (Supabase, Neon, AWS RDS).
2. Execute `npx prisma db push` para criar as tabelas no servidor Postgres.
3. Configure as variáveis de ambiente no painel da plataforma de alojamento.

---

## 🛡️ Backups e Segurança

- **Backups Automáticos:** O sistema gera snapshots JSON em `data/arknet-db.json` e possui ferramentas de exportação no `/admin/definicoes`.
- **Proteção de Rotas:** O middleware Next.js valida cabeçalhos HTTP estritos (`X-Frame-Options`, `CSP`, `nosniff`, `Strict-Transport-Security`) e protege todas as rotas `/admin/*` e `/api/admin/*`.
- **Livro de Reclamações:** Totalmente em conformidade com o Decreto Presidencial angolano sobre proteção do consumidor e transparência comercial.

---
Desenvolvido com excelência por **ARKNET Angola** & **J.Matos Tecnologia**.