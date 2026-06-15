-- Schema do Supabase para o Bohac Med
-- Execute este SQL no painel do Supabase: Database > SQL Editor > New Query

-- ── Tabela de leads ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cnpj TEXT,
  mensagem TEXT,
  origem TEXT DEFAULT 'site' CHECK (origem IN ('site', 'whatsapp')),
  resultado_analise JSONB,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  contatado BOOLEAN DEFAULT FALSE,
  notas TEXT
);

-- Índices para busca
CREATE INDEX IF NOT EXISTS idx_leads_cnpj ON leads(cnpj);
CREATE INDEX IF NOT EXISTS idx_leads_criado_em ON leads(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_leads_contatado ON leads(contatado);

-- ── Tabela de análises (cache de CNPJs já consultados) ───────────────────────
CREATE TABLE IF NOT EXISTS analises_cnpj (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cnpj TEXT NOT NULL UNIQUE,
  razao_social TEXT,
  resultado JSONB NOT NULL,
  analisado_em TIMESTAMPTZ DEFAULT NOW(),
  -- Cache expira em 30 dias (verificar na aplicação)
  expira_em TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_analises_cnpj ON analises_cnpj(cnpj);

-- ── RLS (Row Level Security) — desabilita acesso público direto ──────────────
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises_cnpj ENABLE ROW LEVEL SECURITY;

-- Apenas o service_role (backend) pode inserir/ler
-- O frontend nunca acessa essas tabelas diretamente
CREATE POLICY "Apenas service role" ON leads
  USING (auth.role() = 'service_role');

CREATE POLICY "Apenas service role" ON analises_cnpj
  USING (auth.role() = 'service_role');

-- ── Comentários ──────────────────────────────────────────────────────────────
COMMENT ON TABLE leads IS 'Leads capturados pelo Bohac Med — médicos e clínicas interessados na tese de equiparação hospitalar';
COMMENT ON COLUMN leads.resultado_analise IS 'JSON com o resultado da análise de CNPJ/NF-e no momento do cadastro';
COMMENT ON COLUMN leads.contatado IS 'Marque TRUE quando o advogado já entrou em contato com o lead';
COMMENT ON TABLE analises_cnpj IS 'Cache de análises de CNPJ para evitar re-consultas à Receita Federal';
