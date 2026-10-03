import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { TypeRepeater } from '@/components/layout/TypeRepeater'
import { CampusArtifact } from '@/components/layout/CampusArtifact'
import { CampusGallery } from '@/components/layout/CampusGallery'

export default function Home() {
  return <>
    <section className="type-stage hero">
      <TypeRepeater />
      <div className="shell hero-content">
        <p className="eyebrow" style={{ color: '#d7e5ff' }}>A vida universitária acontece junto</p>
        <h1 className="display">Encontre quem faz sua jornada <span className="script">acontecer.</span></h1>
        <p className="hero-copy">Uma matéria em comum pode ser o começo de um grupo de estudos, um projeto ou uma grande ideia. Conecte-se com estudantes da FAESA que estão na mesma sintonia.</p>
        <div className="hero-actions">
          <Link href="/login?mode=register" className="btn btn-white">Começar agora <ArrowRight size={17} /></Link>
          <a href="#como-funciona" className="btn" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.45)' }}>Conhecer a plataforma</a>
        </div>
        <p className="hero-note">Para estudantes com e-mail institucional FAESA</p>
      </div>
    </section>

    <section className="artifact-section" aria-labelledby="artifact-title">
      <div className="shell artifact-layout">
        <div className="artifact-copy">
          <p className="eyebrow">Ideias em movimento</p>
          <h2 className="display" id="artifact-title">Toda grande ideia começa com um <span className="script">encontro.</span></h2>
          <p>Entre livros e conversas, uma matéria em comum pode virar uma parceria. Encontre quem compartilha o que você está estudando.</p>
          <Link href="/login?mode=register" className="text-link">Encontre sua turma <ArrowRight size={18} /></Link>
        </div>
        <CampusArtifact />
      </div>
    </section>

    <section id="como-funciona" className="section-pad shell">
      <p className="eyebrow">Feito para aproximar</p>
      <h2 className="display" style={{ maxWidth: 680, marginTop: 16, fontSize: 'clamp(36px, 5vw, 64px)' }}>A conexão certa começa pelo que você está vivendo agora.</h2>
      <div className="feature-grid">
        <article className="feature-card"><span className="feature-number">01 / SEU MOMENTO</span><h3>Suas matérias</h3><p>Selecione as disciplinas que está estudando a partir da grade oficial do seu curso, presencial ou EAD.</p></article>
        <article className="feature-card"><span className="feature-number">02 / SUAS PESSOAS</span><h3>Encontros com sentido</h3><p>Descubra colegas com matérias, habilidades e objetivos em comum para estudar ou criar um projeto.</p></article>
        <article className="feature-card"><span className="feature-number">03 / SEU PRÓXIMO PASSO</span><h3>Conexões no seu ritmo</h3><p>Converse depois que a outra pessoa aceitar seu convite. Seu contato permanece privado até lá.</p></article>
      </div>
    </section>

    <CampusGallery />

    <section className="landing-band"><div className="shell landing-band-inner"><div><p className="eyebrow" style={{ color: '#bcd0ff' }}>Connect FAESA</p><h2 className="display" style={{ marginTop: 12 }}>Seu próximo parceiro de estudos pode estar a uma matéria de distância.</h2></div><Link className="btn btn-white" href="/login?mode=register">Criar meu perfil <ArrowRight size={17} /></Link></div></section>
    <footer className="footer shell">Connect FAESA · Um espaço de conexão entre estudantes da FAESA.</footer>
  </>
}
