-- Tabela de tratamentos de leads (CRM simples)
CREATE TABLE IF NOT EXISTS lead_tratamentos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  fase        TEXT NOT NULL,
  anotacao    TEXT NOT NULL,
  criado_por  TEXT NOT NULL DEFAULT 'Guilherme',
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index para buscas por lead
CREATE INDEX IF NOT EXISTS idx_tratamentos_lead_id ON lead_tratamentos(lead_id);

-- RLS: apenas service_role pode inserir/atualizar; anon pode ler (para o dashboard)
ALTER TABLE lead_tratamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de tratamentos"
  ON lead_tratamentos FOR SELECT
  USING (true);

CREATE POLICY "Inserção autenticada de tratamentos"
  ON lead_tratamentos FOR INSERT
  WITH CHECK (true);
