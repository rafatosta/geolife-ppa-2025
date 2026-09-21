import { Leaf, LoadState, SpeciesCard } from "../components/AtlasUI";
import { useAtlas } from "../framework/useAtlas";

export function HomePage() {
  const atlas = useAtlas();
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="hero-kicker">
            CONHECER É O PRIMEIRO PASSO PARA PRESERVAR
          </p>
          <h1>GeoLife</h1>
          <p className="hero-subtitle">Atlas Digital da Biodiversidade Local</p>
          <p>
            Um olhar sobre a vida ao nosso redor.
            <br />
            Explore espécies, conheça regiões e registre suas observações.
          </p>
          <div className="button-row">
            <a className="button" href="#/mapa">
              Explorar mapa <span aria-hidden="true">↗</span>
            </a>
            <a className="button hero-outline" href="#/especies">
              Buscar espécies <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <span className="hero-credit">
          Imagem de apresentação do modelo visual
        </span>
      </section>
      <div className="container">
        <LoadState
          loading={atlas.loading}
          error={atlas.error}
          retry={atlas.reload}
        />
      </div>
      {!atlas.loading && !atlas.error && (
        <>
          <section className="stats-strip" aria-label="Totais do catálogo">
            <div className="container stats">
              <div>
                <strong>{atlas.especies.length}</strong>
                <span>Espécies catalogadas</span>
              </div>
              <div>
                <strong>{atlas.regioes.length}</strong>
                <span>Regiões cadastradas</span>
              </div>
              <div>
                <strong>{atlas.observacoes.length}</strong>
                <span>Observações registradas</span>
              </div>
            </div>
          </section>
          <section className="container section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">DESCUBRA O ATLAS</p>
                <h2>Conheça as espécies</h2>
                <p className="muted">
                  Fauna e flora presentes no nosso catálogo.
                </p>
              </div>
              <a className="text-link" href="#/especies">
                Ver todas as espécies →
              </a>
            </div>
            <div className="species-grid">
              {atlas.especies.slice(0, 3).map((s) => (
                <SpeciesCard
                  key={s.id}
                  species={s}
                  count={
                    atlas.observacoes.filter((o) => o.especieId === s.id).length
                  }
                  photo={
                    atlas.observacoes.find(
                      (o) => o.especieId === s.id && o.fotoUrl,
                    )?.fotoUrl
                  }
                />
              ))}
            </div>
            {!atlas.especies.length && (
              <p className="empty-state">Ainda não há espécies cadastradas.</p>
            )}
          </section>
        </>
      )}
      <section className="contribute">
        <div className="container">
          <Leaf />
          <h2>Cada observação amplia nosso conhecimento</h2>
          <p>
            Registre uma ocorrência de uma espécie e ajude a construir o atlas
            da biodiversidade.
          </p>
          <a className="button hero-outline" href="#/cadastro">
            Registrar observação →
          </a>
        </div>
      </section>
    </>
  );
}
