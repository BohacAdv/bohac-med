-- Anexo de notas fiscais enviadas pelo lead na tela /analise,
-- e parecer da IA gerado a partir da leitura desses arquivos.
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS notas_fiscais JSONB,
  ADD COLUMN IF NOT EXISTS parecer_nfe JSONB;

COMMENT ON COLUMN leads.notas_fiscais IS 'Array de {nomeArquivo, caminho, tipo} dos arquivos de nota fiscal anexados pelo lead, armazenados no bucket notas-fiscais';
COMMENT ON COLUMN leads.parecer_nfe IS 'Parecer da IA (parecer, enquadradoGeral, nivelViabilidadeGeral, notas[]) gerado a partir das notas fiscais anexadas';

-- Bucket privado para armazenar os arquivos de notas fiscais.
-- Apenas o service_role (backend) tem acesso — nunca exposto diretamente ao navegador do lead.
INSERT INTO storage.buckets (id, name, public)
VALUES ('notas-fiscais', 'notas-fiscais', false)
ON CONFLICT (id) DO NOTHING;
