-- Create handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Connections Table
CREATE TABLE public.connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sender_id, receiver_id)
);

-- RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Usuários podem ver suas próprias conexões"
ON public.connections FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Usuários podem iniciar conexões"
ON public.connections FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Destinatários podem atualizar o status da conexão"
ON public.connections FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Usuários podem deletar suas próprias conexões"
ON public.connections FOR DELETE
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Trigger para updated_at
CREATE TRIGGER update_connections_updated_at
BEFORE UPDATE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
