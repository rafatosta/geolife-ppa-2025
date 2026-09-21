import { useState } from "react";
import { LoadState, PageHeader, SpeciesCard } from "../components/AtlasUI";
import { useAtlas } from "../framework/useAtlas";
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function CatalogoPage() {
  const atlas = useAtlas();
  const [search, setSearch] = useState("");
  const [classe, setClasse] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const filtered = atlas.especies.filter(
    (s) =>
      normalize(`${s.nomePopular} ${s.nomeCientifico}`).includes(
        normalize(search.trim()),
      ) &&
      (!classe || s.classe === classe) &&
      (!status || s.statusConservacao === status) &&
      (!region ||
        atlas.observacoes.some(
          (o) => o.especieId === s.id && o.regiaoId === Number(region),
        )),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 9));
  const current = Math.min(page, pages);
  return (
    <div className="container section">
      <PageHeader
        title="Catálogo de espécies"
        description="Explore a diversidade da fauna e da flora registrada no GeoLife."
      >
        <a className="button" href="#/gerenciar-especies">
          Gerenciar espécies
        </a>
      </PageHeader>
      <LoadState
        loading={atlas.loading}
        error={atlas.error}
        retry={atlas.reload}
      />
      {!atlas.loading && !atlas.error && (
        <>
          <div className="filter-panel">
            <label className="search-field">
              Buscar espécie
              <input
                type="search"
                placeholder="Nome popular ou científico…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <label>
              Classe
              <select
                value={classe}
                onChange={(e) => {
                  setClasse(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todas as classes</option>
                {[
                  ...new Set(
                    atlas.especies.map((s) => s.classe).filter(Boolean),
                  ),
                ]
                  .sort()
                  .map((c) => (
                    <option key={c} value={c!}>
                      {c}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Região de observação
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todas as regiões</option>
                {atlas.regioes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Conservação
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todos os status</option>
                {[
                  ...new Set(
                    atlas.especies
                      .map((s) => s.statusConservacao)
                      .filter(Boolean),
                  ),
                ]
                  .sort()
                  .map((c) => (
                    <option key={c} value={c!}>
                      {c}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <div className="results-line">
            <p role="status">
              {filtered.length}{" "}
              {filtered.length === 1
                ? "espécie encontrada"
                : "espécies encontradas"}
            </p>
            <button
              className="text-link"
              onClick={() => {
                setSearch("");
                setClasse("");
                setRegion("");
                setStatus("");
                setPage(1);
              }}
            >
              Limpar filtros
            </button>
          </div>
          <div className="species-grid">
            {filtered.slice((current - 1) * 9, current * 9).map((s) => (
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
          {!filtered.length && (
            <p className="empty-state">
              Nenhuma espécie corresponde aos filtros. Experimente outra busca.
            </p>
          )}
          <nav className="pagination" aria-label="Paginação do catálogo">
            <button
              className="button secondary"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              Anterior
            </button>
            <span>
              Página {current} de {pages}
            </span>
            <button
              className="button secondary"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              Próximo
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
