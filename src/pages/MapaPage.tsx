import { useMemo, useState } from "react";
import {
  IllustrationNotice,
  LoadState,
  PageHeader,
} from "../components/AtlasUI";
import { hasCoordinates, RegionMap } from "../components/RegionMap";
import { useAtlas } from "../framework/useAtlas";

export function MapaPage() {
  const atlas = useAtlas();
  const [regionId, setRegionId] = useState("");
  const [speciesId, setSpeciesId] = useState("");
  const observations = useMemo(
    () =>
      atlas.observacoes.filter(
        (o) =>
          (!regionId || o.regiaoId === Number(regionId)) &&
          (!speciesId || o.especieId === Number(speciesId)),
      ),
    [atlas.observacoes, regionId, speciesId],
  );
  const regions = useMemo(
    () =>
      atlas.regioes.filter((r) =>
        observations.some((o) => o.regiaoId === r.id),
      ),
    [atlas.regioes, observations],
  );
  const missing = observations.filter(
    (o) => !regions.some((r) => r.id === o.regiaoId && hasCoordinates(r)),
  ).length;
  return (
    <div className="container section">
      <PageHeader
        title="Mapa da biodiversidade"
        description="Explore as regiões associadas às observações do atlas."
      />
      <LoadState
        loading={atlas.loading}
        error={atlas.error}
        retry={atlas.reload}
      />
      {!atlas.loading && !atlas.error && (
        <>
          <p className="info-note">
            Os marcadores usam as coordenadas das regiões. Eles não representam
            o ponto exato de cada avistamento.
          </p>
          <div className="map-layout">
            <section className="map-panel">
              {regions.some(hasCoordinates) ? (
                <RegionMap
                  regions={regions}
                  observations={observations}
                  species={atlas.especies}
                />
              ) : (
                <p className="empty-state">
                  Nenhuma região com coordenadas disponíveis para estes filtros.
                </p>
              )}
            </section>
            <aside className="panel">
              <h2>Explorar registros</h2>
              <label>
                Espécie
                <select
                  value={speciesId}
                  onChange={(e) => setSpeciesId(e.target.value)}
                >
                  <option value="">Todas as espécies</option>
                  {atlas.especies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nomePopular}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Região
                <select
                  value={regionId}
                  onChange={(e) => setRegionId(e.target.value)}
                >
                  <option value="">Todas as regiões</option>
                  {atlas.regioes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nome}
                    </option>
                  ))}
                </select>
              </label>
              <p role="status">
                {observations.length} observações ·{" "}
                {regions.filter(hasCoordinates).length} regiões no mapa
              </p>
              <p className="muted">
                {missing} observações sem coordenadas regionais válidas.
              </p>
              <section className="illustrative-section">
                <h3>Camadas ambientais</h3>
                <IllustrationNotice />
                <fieldset disabled>
                  <label>
                    <input type="checkbox" /> Vegetação
                  </label>
                  <label>
                    <input type="checkbox" /> Rios e lagos
                  </label>
                  <label>
                    <input type="checkbox" /> Áreas de preservação
                  </label>
                </fieldset>
                <p className="muted">
                  As camadas temáticas ainda não estão disponíveis.
                </p>
              </section>
            </aside>
          </div>
          <section className="section">
            <h2>Regiões e observações</h2>
            <p className="muted">
              Alternativa em texto para consultar os mesmos registros do mapa.
            </p>
            <div className="observation-grid">
              {regions.map((r) => (
                <article className="panel" key={r.id}>
                  <h3>{r.nome}</h3>
                  <p>
                    {hasCoordinates(r)
                      ? `${r.latitude}, ${r.longitude}`
                      : "Coordenadas não informadas ou inválidas"}
                  </p>
                  <ul className="occurrence-list">
                    {observations
                      .filter((o) => o.regiaoId === r.id)
                      .map((o) => (
                        <li key={o.id}>
                          <a href={`#/especies/${o.especieId}`}>
                            {atlas.especies.find((s) => s.id === o.especieId)
                              ?.nomePopular || "Espécie"}
                          </a>
                          <span>{o.data.split("-").reverse().join("/")}</span>
                        </li>
                      ))}
                  </ul>
                </article>
              ))}
            </div>
            {!observations.length && (
              <p className="empty-state">
                Nenhuma observação corresponde aos filtros.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
