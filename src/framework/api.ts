/** INFRAESTRUTURA: encapsula Fetch, JSON, métodos HTTP e erros. */
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new Error(
      "Não foi possível conectar à API. Verifique se o backend está em execução e tente novamente.",
    );
  }
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message =
      typeof error?.message === "string"
        ? error.message
        : "A API está indisponível. Tente novamente.";
    if (message.includes("UNIQUE constraint"))
      throw new Error("Já existe uma espécie com este nome científico.");
    if (message.includes("FOREIGN KEY constraint"))
      throw new Error(
        options.method === "DELETE"
          ? "Este registro possui observações vinculadas. Remova ou altere os vínculos antes de excluí-lo."
          : "A espécie ou a região selecionada não está mais disponível. Recarregue os registros.",
      );
    if (response.status === 401 || response.status === 403)
      throw new Error("Acesso não autorizado pela API.");
    if (message.includes("NOT NULL constraint"))
      throw new Error("Preencha todos os campos obrigatórios.");
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(
      "A API retornou uma resposta inválida. Recarregue os registros antes de tentar novamente.",
    );
  }
}

export type CrudApi<TEntity, TCreate> = {
  listar(): Promise<TEntity[]>;
  buscar(id: number): Promise<TEntity>;
  criar(data: TCreate): Promise<TEntity>;
  atualizar(id: number, data: TCreate): Promise<TEntity>;
  excluir(id: number): Promise<void>;
};

export function createCrudApi<TEntity, TCreate>(
  resource: string,
): CrudApi<TEntity, TCreate> {
  const base = `/api/${resource}`;
  return {
    listar: () => request<TEntity[]>(base),
    buscar: (id) => request<TEntity>(`${base}/${id}`),
    criar: (data) =>
      request<TEntity>(base, { method: "POST", body: JSON.stringify(data) }),
    atualizar: (id, data) =>
      request<TEntity>(`${base}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    excluir: (id) => request<void>(`${base}/${id}`, { method: "DELETE" }),
  };
}
