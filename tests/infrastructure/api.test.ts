import { afterEach, describe, expect, it, vi } from "vitest";

const { getSupabase } = vi.hoisted(() => ({ getSupabase: vi.fn() }));
vi.mock("../../src/framework/supabase", () => ({ getSupabase }));

import { createCrudApi } from "../../src/framework/api";

type Item = { id: number; nome: string };
type NewItem = { nome: string };
type ItemRow = { id: number; nome_item: string };

const api = createCrudApi<Item, NewItem, ItemRow>({
  table: "itens",
  idColumn: "id",
  fromRow: (row) => ({ id: row.id, nome: row.nome_item }),
  toRow: (item) => ({ nome_item: item.nome }),
});

afterEach(() => vi.clearAllMocks());

describe("infraestrutura Supabase", () => {
  it("lista a tabela e converte snake_case para o modelo", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: 1, nome_item: "Teste" }],
      error: null,
    });
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));
    getSupabase.mockReturnValue({ from });

    await expect(api.listar()).resolves.toEqual([{ id: 1, nome: "Teste" }]);
    expect(from).toHaveBeenCalledWith("itens");
    expect(order).toHaveBeenCalledWith("id", { ascending: false });
  });

  it("converte o payload e devolve a linha criada", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: 2, nome_item: "Novo" },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    getSupabase.mockReturnValue({ from: vi.fn(() => ({ insert })) });

    await expect(api.criar({ nome: "Novo" })).resolves.toEqual({
      id: 2,
      nome: "Novo",
    });
    expect(insert).toHaveBeenCalledWith({ nome_item: "Novo" });
  });

  it("filtra pelo id ao excluir", async () => {
    const eq = vi.fn().mockResolvedValue({ data: null, error: null });
    const remove = vi.fn(() => ({ eq }));
    getSupabase.mockReturnValue({ from: vi.fn(() => ({ delete: remove })) });

    await expect(api.excluir(3)).resolves.toBeUndefined();
    expect(eq).toHaveBeenCalledWith("id", 3);
  });

  it.each([
    ["23505", "Já existe uma espécie"],
    ["23503", "observações vinculadas"],
    ["23502", "campos obrigatórios"],
    ["42501", "Acesso não autorizado"],
  ])("traduz o erro PostgreSQL %s", async (code, message) => {
    const eq = vi.fn().mockResolvedValue({
      data: null,
      error: { code, message: "erro", details: "", hint: "" },
    });
    getSupabase.mockReturnValue({
      from: vi.fn(() => ({ delete: vi.fn(() => ({ eq })) })),
    });

    await expect(api.excluir(1)).rejects.toThrow(message);
  });
});
