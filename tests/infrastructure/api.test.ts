import { afterEach, describe, expect, it, vi } from "vitest";
import { createCrudApi } from "../../src/framework/api";

type Item = { id: number; nome: string };
type NewItem = { nome: string };

const api = createCrudApi<Item, NewItem>("itens");

afterEach(() => vi.restoreAllMocks());

describe("infraestrutura da API", () => {
  it("lista recursos usando /api", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([{ id: 1, nome: "Teste" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(api.listar()).resolves.toEqual([{ id: 1, nome: "Teste" }]);
    expect(fetchMock).toHaveBeenCalledWith("/api/itens", expect.any(Object));
  });

  it("envia JSON ao criar", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: 2, nome: "Novo" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await api.criar({ nome: "Novo" });
    const [, options] = fetchMock.mock.calls[0];
    expect(options?.method).toBe("POST");
    expect(new Headers(options?.headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("não envia Content-Type JSON em DELETE sem corpo", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await api.excluir(3);
    const [, options] = fetchMock.mock.calls[0];
    expect(options?.method).toBe("DELETE");
    expect(new Headers(options?.headers).has("Content-Type")).toBe(false);
  });
});

it("traduz falhas de conexão e restrições do banco", async () => {
  vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
    new TypeError("Failed to fetch"),
  );
  await expect(api.listar()).rejects.toThrow("Não foi possível conectar à API");
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        message: "UNIQUE constraint failed: especie.nome_cientifico",
      }),
      { status: 400 },
    ),
  );
  await expect(api.criar({ nome: "Teste" })).rejects.toThrow(
    "Já existe uma espécie",
  );
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify({ message: "FOREIGN KEY constraint failed" }), {
      status: 400,
    }),
  );
  await expect(api.excluir(1)).rejects.toThrow("observações vinculadas");
});
it("trata resposta inválida e proibição de acesso", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response("indisponível", { status: 502 }),
  );
  await expect(api.listar()).rejects.toThrow("API está indisponível");
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response("invalid", { status: 200 }),
  );
  await expect(api.listar()).rejects.toThrow("resposta inválida");
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response("", { status: 403 }),
  );
  await expect(api.listar()).rejects.toThrow("Acesso não autorizado");
});
