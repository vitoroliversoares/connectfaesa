-- Create Enums
CREATE TYPE course_type AS ENUM ('Administração', 'Arquitetura', 'Engenharias', 'Ciência da Computação', 'Sistemas de Informação', 'Design', 'Outros');
CREATE TYPE shift_type AS ENUM ('Matutino', 'Vespertino', 'Noturno');
CREATE TYPE main_goal_type AS ENUM ('TCC', 'Startup', 'Grupo de Estudos', 'Extracurricular', 'Outros');
CREATE TYPE availability_hours_type AS ENUM ('1 a 3', '4 a 7', 'Mais de 8');

-- Create Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  whatsapp TEXT,
  institutional_email TEXT UNIQUE NOT NULL,
  course course_type,
  shift shift_type,
  main_goal main_goal_type,
  specific_goal TEXT,
  top_skills TEXT[] CHECK (array_length(top_skills, 1) <= 2),
  specific_skills JSONB,
  partner_needs TEXT[],
  availability_hours availability_hours_type,
  consent_lgpd BOOLEAN NOT NULL DEFAULT FALSE,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfis são visíveis para todos os usuários autenticados" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Function and Trigger for Updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Function and Trigger for New User
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, institutional_email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
