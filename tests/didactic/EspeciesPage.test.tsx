import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  listar: vi.fn(),
  criar: vi.fn(),
  atualizar: vi.fn(),
  excluir: vi.fn(),
  buscar: vi.fn(),
}));
vi.mock("../../src/framework/resources", () => ({ especiesApi: api }));
import { EspeciesPage } from "../../src/pages/EspeciesPage";

const especie = {
  id: 1,
  nomePopular: "Onça-pintada",
  nomeCientifico: "Panthera onca",
  familia: "Felidae",
  classe: "Mammalia",
  statusConservacao: "Quase ameaçada",
};

beforeEach(() => {
  vi.clearAllMocks();
  api.listar.mockResolvedValue([especie]);
  api.criar.mockResolvedValue({ ...especie, id: 2 });
  api.atualizar.mockResolvedValue(especie);
  api.excluir.mockResolvedValue(undefined);
});

describe("EspeciesPage", () => {
  it("lista e cadastra uma espécie", async () => {
    const user = userEvent.setup();
    render(<EspeciesPage />);
    expect(await screen.findByText("Onça-pintada")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Nome popular"), "Tatu-bola");
    await user.type(
      screen.getByLabelText("Nome científico"),
      "Tolypeutes tricinctus",
    );
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(api.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        nomePopular: "Tatu-bola",
        nomeCientifico: "Tolypeutes tricinctus",
        familia: null,
      }),
    );
  });

  it("edita e exclui uma espécie", async () => {
    const user = userEvent.setup();
    render(<EspeciesPage />);
    await screen.findByText("Onça-pintada");
    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.clear(screen.getByLabelText("Status de conservação"));
    await user.type(
      screen.getByLabelText("Status de conservação"),
      "Vulnerável",
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(api.atualizar).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ statusConservacao: "Vulnerável" }),
    );
    await user.click(screen.getByRole("button", { name: "Excluir" }));
    expect(api.excluir).toHaveBeenCalledWith(1);
  });
});

it("mantém o formulário preenchido após falha e bloqueia envios repetidos", async () => {
  const user = userEvent.setup();
  api.criar.mockRejectedValueOnce(new Error("Nome científico já cadastrado"));
  render(<EspeciesPage />);
  await screen.findByText("Onça-pintada");
  await user.type(screen.getByLabelText("Nome popular"), "Teste");
  await user.type(screen.getByLabelText("Nome científico"), "Species teste");
  await user.click(screen.getByRole("button", { name: "Cadastrar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Nome científico já cadastrado",
  );
  expect(screen.getByLabelText("Nome popular")).toHaveValue("Teste");
  expect(
    screen.queryByText("Registro cadastrado com sucesso."),
  ).not.toBeInTheDocument();
  let finish!: (value: unknown) => void;
  api.criar.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await user.dblClick(screen.getByRole("button", { name: "Cadastrar" }));
  expect(api.criar).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("button", { name: "Salvando…" })).toBeDisabled();
  finish({ ...especie, id: 2, nomePopular: "Teste" });
  expect(
    await screen.findByText("Registro cadastrado com sucesso."),
  ).toBeInTheDocument();
});
