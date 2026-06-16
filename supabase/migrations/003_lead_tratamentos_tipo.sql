-- Adiciona coluna "tipo" em lead_tratamentos para distinguir
-- mudança de fase (Kanban) de comentário livre (anotação interna sem
-- alterar a fase do lead).
ALTER TABLE lead_tratamentos
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'fase'
  CHECK (tipo IN ('fase', 'comentario'));

-- Registros de comentário não precisam estar associados a uma fase
ALTER TABLE lead_tratamentos ALTER COLUMN fase DROP NOT NULL;

-- Index para filtrar histórico por tipo (fase x comentário)
CREATE INDEX IF NOT EXISTS idx_tratamentos_tipo ON lead_tratamentos(tipo);
