/** Estado e operações compartilhados: mantém formulários montados durante a gravação. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { CrudApi } from "./api";

export function useCrud<TEntity extends { id: number }, TCreate>(
  api: CrudApi<TEntity, TCreate>,
) {
  const [items, setItems] = useState<TEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const pending = useRef(false);
  const active = useRef(true);
  const recarregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listar();
      if (active.current) {
        setItems(data);
        setError(null);
      }
    } catch (err) {
      if (active.current)
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os registros.",
        );
    } finally {
      if (active.current) setLoading(false);
    }
  }, [api]);
  useEffect(() => {
    active.current = true;
    void recarregar();
    return () => {
      active.current = false;
    };
  }, [recarregar]);
  const executar = async (operation: () => Promise<void>, success: string) => {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await operation();
      if (active.current) setMessage(success);
      return true;
    } catch (err) {
      if (active.current)
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível salvar. Tente novamente.",
        );
      return false;
    } finally {
      pending.current = false;
      if (active.current) setBusy(false);
    }
  };
  const criar = (data: TCreate) =>
    executar(async () => {
      const created = await api.criar(data);
      if (active.current) setItems((current) => [created, ...current]);
    }, "Registro cadastrado com sucesso.");
  const atualizar = (id: number, data: TCreate) =>
    executar(async () => {
      const updated = await api.atualizar(id, data);
      if (active.current)
        setItems((current) =>
          current.map((item) => (item.id === id ? updated : item)),
        );
    }, "Registro atualizado com sucesso.");
  const excluir = (id: number) =>
    executar(async () => {
      await api.excluir(id);
      if (active.current)
        setItems((current) => current.filter((item) => item.id !== id));
    }, "Registro excluído com sucesso.");
  return {
    items,
    loading,
    busy,
    error,
    message,
    criar,
    atualizar,
    excluir,
    recarregar,
  };
}
