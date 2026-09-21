/** INFRAESTRUTURA: traduz o CRUD da aplicação para consultas ao Supabase. */
import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

export type CrudApi<TEntity, TCreate> = {
  listar(): Promise<TEntity[]>;
  buscar(id: number): Promise<TEntity>;
  criar(data: TCreate): Promise<TEntity>;
  atualizar(id: number, data: TCreate): Promise<TEntity>;
  excluir(id: number): Promise<void>;
};

type CrudResource<TEntity, TCreate, TRow extends Record<string, unknown>> = {
  table: string;
  idColumn: string;
  fromRow(row: TRow): TEntity;
  toRow(data: TCreate): Omit<TRow, "id">;
};

function translateError(error: PostgrestError): Error {
  if (error.code === "23505")
    return new Error("Já existe uma espécie com este nome científico.");
  if (error.code === "23503")
    return new Error(
      "Este registro possui observações vinculadas. Remova ou altere os vínculos antes de excluí-lo.",
    );
  if (error.code === "23502")
    return new Error("Preencha todos os campos obrigatórios.");
  if (error.code === "42501" || error.code === "PGRST301")
    return new Error("Acesso não autorizado pelo Supabase.");
  return new Error(
    error.message || "O Supabase está indisponível. Tente novamente.",
  );
}

function requireData<T>(data: T | null, error: PostgrestError | null): T {
  if (error) throw translateError(error);
  if (data == null)
    throw new Error("O Supabase não retornou os dados esperados.");
  return data;
}

export function createCrudApi<
  TEntity,
  TCreate,
  TRow extends Record<string, unknown>,
>(resource: CrudResource<TEntity, TCreate, TRow>): CrudApi<TEntity, TCreate> {
  return {
    async listar() {
      const { data, error } = await getSupabase()
        .from(resource.table)
        .select("*")
        .order(resource.idColumn, { ascending: false });
      return requireData(data as TRow[] | null, error).map(resource.fromRow);
    },
    async buscar(id) {
      const { data, error } = await getSupabase()
        .from(resource.table)
        .select("*")
        .eq(resource.idColumn, id)
        .single();
      return resource.fromRow(requireData(data as TRow | null, error));
    },
    async criar(data) {
      const result = await getSupabase()
        .from(resource.table)
        .insert(resource.toRow(data) as never)
        .select("*")
        .single();
      return resource.fromRow(
        requireData(result.data as TRow | null, result.error),
      );
    },
    async atualizar(id, data) {
      const result = await getSupabase()
        .from(resource.table)
        .update(resource.toRow(data) as never)
        .eq(resource.idColumn, id)
        .select("*")
        .single();
      return resource.fromRow(
        requireData(result.data as TRow | null, result.error),
      );
    },
    async excluir(id) {
      const { error } = await getSupabase()
        .from(resource.table)
        .delete()
        .eq(resource.idColumn, id);
      if (error) throw translateError(error);
    },
  };
}
