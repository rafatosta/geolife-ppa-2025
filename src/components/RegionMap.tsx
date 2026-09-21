/** Leaflet fica encapsulado; as páginas fornecem somente regiões e observações. */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Regiao } from "../models/Regiao";
import type { Observacao } from "../models/Observacao";
import type { Especie } from "../models/Especie";

export function hasCoordinates(
  r: Regiao,
): r is Regiao & { latitude: number; longitude: number } {
  return (
    r.latitude != null &&
    r.longitude != null &&
    Number.isFinite(r.latitude) &&
    Number.isFinite(r.longitude) &&
    Math.abs(r.latitude) <= 90 &&
    Math.abs(r.longitude) <= 180
  );
}
export function RegionMap({
  regions,
  observations,
  species,
}: {
  regions: Regiao[];
  observations: Observacao[];
  species: Especie[];
}) {
  const container = useRef<HTMLDivElement>(null);
  const [tileError, setTileError] = useState(false);
  useEffect(() => {
    if (!container.current) return;
    setTileError(false);
    const map = L.map(container.current, { scrollWheelZoom: false }).setView(
      [-12.5, -40],
      6,
    );
    L.control
      .zoom({
        position: "topright",
        zoomInTitle: "Aproximar",
        zoomOutTitle: "Afastar",
      })
      .addTo(map);
    map.zoomControl.remove();
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    })
      .on("tileerror", () => setTileError(true))
      .addTo(map);
    const points = regions.filter(hasCoordinates);
    for (const region of points) {
      const entries = observations.filter((o) => o.regiaoId === region.id);
      const content = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = region.nome;
      content.append(title);
      const note = document.createElement("p");
      note.textContent = `${entries.length} observações • Localização aproximada da região`;
      content.append(note);
      for (const id of new Set(entries.map((o) => o.especieId))) {
        const link = document.createElement("a");
        link.href = `#/especies/${id}`;
        link.textContent =
          species.find((s) => s.id === id)?.nomePopular || "Espécie";
        content.append(link, document.createElement("br"));
      }
      L.marker([region.latitude, region.longitude], {
        icon: L.divIcon({
          className: "region-marker",
          html: '<span aria-hidden="true">●</span>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
        title: region.nome,
        alt: `Região ${region.nome}`,
      })
        .bindPopup(content)
        .addTo(map);
    }
    if (points.length)
      map.fitBounds(
        points.map((r) => [r.latitude, r.longitude] as [number, number]),
        { padding: [35, 35], maxZoom: 11 },
      );
    return () => {
      map.remove();
    };
  }, [regions, observations, species]);
  return (
    <>
      {tileError && (
        <p role="status" className="illustration-notice">
          O mapa de fundo está indisponível. Consulte as regiões e coordenadas
          na lista abaixo.
        </p>
      )}
      <div
        ref={container}
        className="region-map"
        aria-label="Mapa das regiões com observações"
      />
    </>
  );
}
