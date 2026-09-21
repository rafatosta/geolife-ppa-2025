import type { ReactNode } from "react";
import { PageHeader } from "../components/AtlasUI";
export function CrudLayout({
  title,
  description,
  loading,
  error,
  message,
  retry,
  children,
}: {
  title: string;
  description: string;
  loading: boolean;
  error: string | null;
  message: string | null;
  retry: () => unknown;
  children: ReactNode;
}) {
  return (
    <section>
      <PageHeader title={title} description={description} />
      {error && (
        <div role="alert" className="error-box">
          <p>{error}</p>
          <button className="text-link" onClick={() => void retry()}>
            Recarregar registros
          </button>
        </div>
      )}
      {message && (
        <p role="status" className="success-message">
          {message}
        </p>
      )}
      {loading ? <p role="status">Carregando…</p> : children}
    </section>
  );
}
export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th scope="col" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export function Actions({
  onEdit,
  onDelete,
  disabled,
}: {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="table-actions">
      <button disabled={disabled} type="button" onClick={onEdit} aria-label="Editar" title="Editar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="m16 3 5 5-12 12-6 1 1-6L16 3Z" />
          <path d="m13 6 5 5" />
        </svg>
      </button>
      <button disabled={disabled} type="button" onClick={onDelete} aria-label="Excluir" title="Excluir">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
        </svg>
      </button>
    </div>
  );
}
export const blankToNull = (value: string) => value.trim() || null;
