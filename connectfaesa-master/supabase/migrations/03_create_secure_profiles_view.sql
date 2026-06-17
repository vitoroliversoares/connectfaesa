-- Criar a View Segura de Perfis com Mascaramento de Contatos na Raiz do Banco
CREATE OR REPLACE VIEW public.student_profiles AS
SELECT 
  p.id,
  p.full_name,
  p.course,
  p.shift,
  p.main_goal,
  p.specific_goal,
  p.top_skills,
  p.specific_skills,
  p.partner_needs,
  p.availability_hours,
  p.consent_lgpd,
  p.feedback,
  p.created_at,
  p.updated_at,
  -- Ocultar WhatsApp no banco se não for o próprio usuário ou se não houver conexão aceita (Match)
  CASE 
    WHEN p.id = auth.uid() THEN p.whatsapp
    WHEN EXISTS (
      SELECT 1 FROM public.connections c 
      WHERE c.status = 'accepted' 
        AND ((c.sender_id = auth.uid() AND c.receiver_id = p.id) 
             OR (c.sender_id = p.id AND c.receiver_id = auth.uid()))
    ) THEN p.whatsapp
    ELSE NULL
  END AS whatsapp,
  -- Ocultar E-mail no banco se não for o próprio usuário ou se não houver conexão aceita (Match)
  CASE 
    WHEN p.id = auth.uid() THEN p.institutional_email
    WHEN EXISTS (
      SELECT 1 FROM public.connections c 
      WHERE c.status = 'accepted' 
        AND ((c.sender_id = auth.uid() AND c.receiver_id = p.id) 
             OR (c.sender_id = p.id AND c.receiver_id = auth.uid()))
    ) THEN p.institutional_email
    ELSE NULL
  END AS institutional_email
FROM public.profiles p;

-- Conceder privilégios de leitura da View para usuários autenticados do Supabase
GRANT SELECT ON public.student_profiles TO authenticated;
