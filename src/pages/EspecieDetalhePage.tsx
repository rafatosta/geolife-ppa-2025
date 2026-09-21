import { LoadState, Photo } from "../components/AtlasUI";
import { useAtlas } from "../framework/useAtlas";

export function EspecieDetalhePage({ id }: { id: number }) {
  const atlas = useAtlas();
  const species = atlas.especies.find((s) => s.id === id);
  const observations = atlas.observacoes.filter((o) => o.especieId === id);
  return (
    <div className="container section">
      <a className="text-link" href="#/especies">
        ← Voltar ao catálogo
      </a>
      <LoadState
        loading={atlas.loading}
        error={atlas.error}
        retry={atlas.reload}
      />
      {!atlas.loading &&
        !atlas.error &&
        (species ? (
          <>
            <header className="page-heading">
              <div>
                <p className="eyebrow">FICHA DA ESPÉCIE</p>
                <h1>{species.nomePopular}</h1>
                <p className="scientific">{species.nomeCientifico}</p>
              </div>
              <a className="button" href={`#/cadastro?especie=${id}`}>
                Registrar observação
              </a>
            </header>
            <div className="detail-grid">
              <div className="detail-photo">
                <Photo
                  url={observations.find((o) => o.fotoUrl)?.fotoUrl}
                  name={species.nomePopular}
                />
              </div>
              <section className="panel">
                <h2>Classificação biológica</h2>
                <dl className="facts">
                  <dt>Família</dt>
                  <dd>{species.familia || "Não informada"}</dd>
                  <dt>Classe</dt>
                  <dd>{species.classe || "Não informada"}</dd>
                  <dt>Status de conservação</dt>
                  <dd>{species.statusConservacao || "Não informado"}</dd>
                  <dt>Observações registradas</dt>
                  <dd>{observations.length}</dd>
                </dl>
                <p className="muted">
                  As fotografias pertencem às observações vinculadas a esta
                  espécie.
                </p>
              </section>
            </div>
            <section className="section">
              <h2>Histórico de observações</h2>
              <p className="muted">
                Ocorrências registradas, com data e região.
              </p>
              <div className="observation-grid">
                {observations.map((o) => (
                  <article className="panel" key={o.id}>
                    <p className="eyebrow">
                      {o.data.split("-").reverse().join("/")}
                    </p>
                    <h3>
                      {atlas.regioes.find((r) => r.id === o.regiaoId)?.nome ||
                        "Região não encontrada"}
                    </h3>
                    <p>{o.descricao || "Sem descrição registrada."}</p>
                    {o.fotoUrl && (
                      <Photo url={o.fotoUrl} name={species.nomePopular} />
                    )}
                  </article>
                ))}
              </div>
              {!observations.length && (
                <p className="empty-state">
                  Esta espécie ainda não possui observações.
                </p>
              )}
            </section>
          </>
        ) : (
          <div className="empty-state">
            <h1>Espécie não encontrada</h1>
            <p>O registro pode ter sido excluído.</p>
          </div>
        ))}
    </div>
  );
}
