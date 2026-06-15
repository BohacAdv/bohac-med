# Bohac Med — Guia de Deploy (sem precisar programar)

## Pré-requisitos (contas gratuitas)

1. **GitHub** — github.com (onde fica o código)
2. **Vercel** — vercel.com (hospeda o site, grátis)
3. **Railway** — railway.app (executa o servidor, ~R$60/mês)
4. **Supabase** — supabase.com (banco de dados, grátis)
5. **Anthropic** — console.anthropic.com (API da IA, pague conforme uso)

---

## Passo 1 — Criar conta no GitHub e fazer upload do código

1. Acesse github.com e crie uma conta gratuita
2. Clique em **"New repository"** → Nome: `bohac-med` → **Create repository**
3. Instale o **GitHub Desktop** (desktop.github.com) para facilitar
4. Abra o GitHub Desktop → **Add local repository** → selecione a pasta `bohac-med`
5. Clique em **Publish repository**

---

## Passo 2 — Configurar o Supabase (banco de dados)

1. Acesse supabase.com → **New project**
2. Nome: `bohac-med` → Escolha uma senha → Região: **South America (São Paulo)**
3. Aguarde criar (2–3 min)
4. Vá em **SQL Editor** → **New Query**
5. Cole o conteúdo do arquivo `src/lib/supabase-schema.sql`
6. Clique em **Run**
7. Copie as credenciais em **Settings → API**:
   - `Project URL` → é o `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → é o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → é o `SUPABASE_SERVICE_ROLE_KEY` (guarde com segurança)

---

## Passo 3 — Obter a API Key da Anthropic (IA)

1. Acesse console.anthropic.com → crie uma conta
2. Vá em **API Keys** → **Create Key**
3. Copie a chave (começa com `sk-ant-`)
4. Esta é o `ANTHROPIC_API_KEY`

---

## Passo 4 — Deploy na Vercel (site)

1. Acesse vercel.com → **Log in with GitHub**
2. Clique em **Add New Project** → selecione o repositório `bohac-med`
3. Na tela de configuração, clique em **Environment Variables** e adicione:

```
ANTHROPIC_API_KEY = sk-ant-...
NEXT_PUBLIC_SUPABASE_URL = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
NEXT_PUBLIC_SITE_URL = https://SEU-PROJETO.vercel.app
LEAD_NOTIFICATION_EMAIL = guilherme.pbh@hotmail.com
```

4. Clique em **Deploy**
5. Aguarde ~3 minutos → o site estará no ar!
6. Anote a URL gerada (ex: `bohac-med.vercel.app`)

---

## Passo 5 — Conectar domínio próprio (opcional, recomendado)

1. Compre o domínio no Registro.br (ex: `bohacmed.com.br`)
2. Na Vercel → seu projeto → **Settings → Domains** → adicione o domínio
3. Siga as instruções para apontar o DNS

---

## Passo 6 — Configurar o WhatsApp (Z-API)

> **Faça isso quando o site já estiver no ar.**

1. Acesse z-api.io → crie uma conta → contrate um plano
2. Crie uma instância → conecte seu número do WhatsApp Business escaneando o QR Code
3. Em **Webhooks**, configure a URL de recebimento:
   `https://SEU-DOMINIO.com.br/api/whatsapp/webhook`
4. Copie o **Instance ID**, **Token** e **Client Token**
5. Adicione nas variáveis de ambiente da Vercel:
   ```
   ZAPI_INSTANCE_ID = ...
   ZAPI_TOKEN = ...
   ZAPI_CLIENT_TOKEN = ...
   ```
6. Faça um novo deploy na Vercel (clique em **Redeploy**)

---

## Ver os leads capturados

1. Acesse supabase.com → seu projeto → **Table Editor** → tabela `leads`
2. Você verá todos os leads com nome, e-mail, telefone, CNPJ e resultado da análise
3. Marque `contatado = TRUE` quando já falar com o lead

---

## Custos mensais estimados

| Serviço | Custo |
|---|---|
| Vercel | Grátis |
| Supabase | Grátis (até 500MB) |
| API Anthropic | ~R$30–80/mês conforme uso |
| Z-API (WhatsApp) | ~R$150/mês |
| Domínio | ~R$40/ano |
| **Total** | **~R$180–230/mês** |
