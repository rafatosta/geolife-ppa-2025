import { useState, type ReactNode } from "react";
import type { Especie } from "../models/Especie";

export function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M20 3c-8-1-16 2-16 9a7 7 0 0 0 7 7c7 0 10-8 9-16Z" />
      <path d="M3 21 15 9M8 16v-5M8 16h5" />
    </svg>
  );
}
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow">ATLAS DA BIODIVERSIDADE</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {children}
    </header>
  );
}
export function IllustrationNotice({ page = false }: { page?: boolean }) {
  return (
    <p className="illustration-notice">
      <span aria-hidden="true">ⓘ </span>
      {page
        ? "Página ilustrativa — funcionalidade ainda não implementada."
        : "Recurso ilustrativo — implementação pendente."}
    </p>
  );
}
export function Photo({ url, name }: { url?: string | null; name: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const safe = url && /^https?:\/\//i.test(url);
  return safe && failedUrl !== url ? (
    <img
      className="record-photo"
      src={url}
      alt={`Registro de ${name}`}
      loading="lazy"
      onError={() => setFailedUrl(url)}
    />
  ) : (
    <div className="photo-empty">
      <Leaf />
      <span>{url ? "Imagem indisponível" : "Sem fotografia registrada"}</span>
    </div>
  );
}
export function SpeciesCard({
  species,
  photo,
  count,
}: {
  species: Especie;
  photo?: string | null;
  count: number;
}) {
  return (
    <a className="species-card" href={`#/especies/${species.id}`}>
      <div className="card-image">
        <Photo url={photo} name={species.nomePopular} />
        <span className="badge">
          {species.classe || "Classe não informada"}
        </span>
      </div>
      <div className="card-content">
        <h3>{species.nomePopular}</h3>
        <p className="scientific">{species.nomeCientifico}</p>
        <div className="card-bottom">
          <span>
            {count} {count === 1 ? "observação" : "observações"}
          </span>
          <span className="detail-link">Ver ficha →</span>
        </div>
      </div>
    </a>
  );
}
export function LoadState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string | null;
  retry: () => unknown;
}) {
  if (loading)
    return (
      <p className="empty-state" role="status">
        Carregando dados do atlas…
      </p>
    );
  if (error)
    return (
      <div className="error-box" role="alert">
        <p>{error}</p>
        <button className="button secondary" onClick={() => void retry()}>
          Tentar novamente
        </button>
      </div>
    );
  return null;
}
