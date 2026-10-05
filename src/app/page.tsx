import { TypeRepeater } from '@/components/layout/TypeRepeater'
import { ArtifactStory } from '@/components/layout/ArtifactStory'
import { CampusGallery } from '@/components/layout/CampusGallery'
import { DirectionalLink } from '@/components/layout/DirectionalLink'
import { RevealOnScroll } from '@/components/layout/RevealOnScroll'
import { SpotlightBand } from '@/components/layout/SpotlightBand'

export default function Home() {
  return <>
    <section className="type-stage hero">
      <TypeRepeater />
      <div className="shell hero-content">
        <p className="eyebrow" style={{ color: '#d7e5ff' }}>A vida universitária acontece junto</p>
        <h1 className="display">Encontre quem faz sua jornada <span className="script">acontecer.</span></h1>
        <p className="hero-copy">Uma matéria em comum pode ser o começo de um grupo de estudos, um projeto ou uma grande ideia. Conecte-se com estudantes da FAESA que estão na mesma sintonia.</p>
        <div className="hero-actions">
          <DirectionalLink href="/login?mode=register" className="btn-white">Começar agora</DirectionalLink>
          <a href="#como-funciona" className="btn" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.45)' }}>Conhecer a plataforma</a>
        </div>
        <p className="hero-note">Para estudantes com e-mail institucional FAESA</p>
      </div>
    </section>

    <ArtifactStory />

    <section id="como-funciona" className="section-pad shell">
      <RevealOnScroll>
        <p className="eyebrow" data-reveal>Feito para aproximar</p>
        <h2 className="display" data-reveal style={{ maxWidth: 680, marginTop: 16, fontSize: 'clamp(36px, 5vw, 64px)' }}>A conexão certa começa pelo que você está vivendo agora.</h2>
        <div className="feature-grid">
          <article className="feature-card" data-reveal><span className="feature-number">01 / SEU MOMENTO</span><h3>Suas matérias</h3><p>Selecione as disciplinas que está estudando a partir da grade oficial do seu curso, presencial ou EAD.</p></article>
          <article className="feature-card" data-reveal><span className="feature-number">02 / SUAS PESSOAS</span><h3>Encontros com sentido</h3><p>Descubra colegas com matérias, habilidades e objetivos em comum para estudar ou criar um projeto.</p></article>
          <article className="feature-card" data-reveal><span className="feature-number">03 / SEU PRÓXIMO PASSO</span><h3>Conexões no seu ritmo</h3><p>Converse depois que a outra pessoa aceitar seu convite. Seu contato permanece privado até lá.</p></article>
        </div>
      </RevealOnScroll>
    </section>

    <CampusGallery />

    <SpotlightBand>
      <div className="shell landing-band-inner">
        <div>
          <p className="eyebrow" style={{ color: '#bcd0ff' }}>Connect FAESA</p>
          <h2 className="display" style={{ marginTop: 12 }}>Seu próximo parceiro de estudos pode estar a uma matéria de distância.</h2>
        </div>
        <DirectionalLink href="/login?mode=register" className="btn-white">Criar meu perfil</DirectionalLink>
      </div>
    </SpotlightBand>
    <footer className="footer shell">Connect FAESA · Um espaço de conexão entre estudantes da FAESA.</footer>
  </>
}
