# Connect FAESA

Comunidade para estudantes da FAESA encontrarem colegas por curso, matérias em estudo, objetivos e habilidades. O contato de cada pessoa só é exibido após um convite aceito.

## Rodar localmente

Requer Node.js compatível com Next.js 16 e um projeto Supabase configurado.

1. Copie `.env.example` para `.env.local` e preencha a URL e a chave pública (`anon`) do Supabase. Não use a chave `service_role` no navegador.
2. Execute `npm ci`.
3. Execute `npm run dev` e abra `http://localhost:3000`.

`npm run build` e `npm run lint` validam o projeto. A página inicial e o acesso podem ser visualizados sem conta; para salvar perfil e usar conexões, o banco precisa da migração abaixo.

## Banco de dados

A mudança desta entrega está em `supabase/migrations/20261003162439_academic_subjects_and_modalities.sql`. Ela adiciona modalidade e matérias ao perfil, permite nomes completos dos cursos e protege a leitura direta de dados de contato. O catálogo e a seleção de matérias dependem dela.

O projeto Supabase conectado já possui o esquema das migrações antigas do repositório, embora o histórico de migrações não esteja registrado nele. A nova migração foi aplicada a esse projeto em 3 de outubro de 2026. Para configurar outro banco com o esquema antigo, aplique apenas a nova migração; executar todas as antigas novamente causará conflito.

## Grades curriculares

`src/data/faesa-catalog.json` é um retrato das páginas de graduação da [FAESA](https://www.faesa.br/) consultadas em 3 de outubro de 2026. Cada curso contém o endereço da página oficial e as matérias organizadas por período. Há 29 cursos presenciais e 8 cursos EAD com páginas acessíveis no catálogo público consultado. A página de Engenharia de Produção presencial não expunha matriz curricular naquele momento; o curso aparece, mas sem matérias para selecionar. Outras páginas EAD listadas no menu principal retornavam erro e não foram incluídas como grades disponíveis. Revise o catálogo quando a FAESA atualizar suas matrizes.

## Tipografia

Telma e Satoshi são carregadas pela API oficial do Fontshare. O repositório não inclui arquivos de fonte. Quando o serviço de fontes estiver indisponível, o navegador usa a fonte de sistema configurada como alternativa.

## Experiência visual

A página inicial apresenta livros e duas canecas em 3D feitos com Three.js e uma galeria contínua com nove fotos do campus fornecidas para o projeto. As fotos estão otimizadas em WebP em `public/campus`. A cena 3D só é carregada quando está próxima da área visível, reage à rolagem e usa uma ilustração estática caso WebGL não esteja disponível. A galeria permite pausa, navegação por botões e setas do teclado. A preferência por movimento reduzido desativa a animação 3D e o avanço automático.
