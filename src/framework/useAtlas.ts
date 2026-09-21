/** Consulta os contratos existentes; nenhuma informação é substituída por dados simulados. */
import { useCallback, useEffect, useState } from "react";
import { especiesApi, observacoesApi, regioesApi } from "./resources";
import type { Especie } from "../models/Especie";
import type { Regiao } from "../models/Regiao";
import type { Observacao } from "../models/Observacao";

export function useAtlas() {
  const [data, setData] = useState<{
    especies: Especie[];
    regioes: Regiao[];
    observacoes: Observacao[];
  }>({ especies: [], regioes: [], observacoes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void Promise.all([
      especiesApi.listar(),
      regioesApi.listar(),
      observacoesApi.listar(),
    ])
      .then(([especies, regioes, observacoes]) => {
        if (active) setData({ especies, regioes, observacoes });
      })
      .catch((err: unknown) => {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar o atlas.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  return { ...data, loading, error, reload };
}
