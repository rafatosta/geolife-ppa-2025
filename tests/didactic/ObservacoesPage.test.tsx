import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const apis = vi.hoisted(() => ({
  observacoes: {
    listar: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    excluir: vi.fn(),
    buscar: vi.fn(),
  },
  especies: {
    listar: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    excluir: vi.fn(),
    buscar: vi.fn(),
  },
  regioes: {
    listar: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    excluir: vi.fn(),
    buscar: vi.fn(),
  },
}));
vi.mock("../../src/framework/resources", () => ({
  observacoesApi: apis.observacoes,
  especiesApi: apis.especies,
  regioesApi: apis.regioes,
}));
import { ObservacoesPage } from "../../src/pages/ObservacoesPage";

const observacao = {
  id: 7,
  data: "2026-09-01",
  descricao: "Registro inicial",
  fotoUrl: null,
  especieId: 1,
  regiaoId: 10,
};

beforeEach(() => {
  vi.clearAllMocks();
  apis.observacoes.listar.mockResolvedValue([observacao]);
  apis.observacoes.criar.mockResolvedValue(observacao);
  apis.observacoes.atualizar.mockResolvedValue(observacao);
  apis.observacoes.excluir.mockResolvedValue(undefined);
  apis.especies.listar.mockResolvedValue([
    {
      id: 1,
      nomePopular: "Onça-pintada",
      nomeCientifico: "Panthera onca",
      familia: null,
      classe: null,
      statusConservacao: null,
    },
    {
      id: 2,
      nomePopular: "Pau-brasil",
      nomeCientifico: "Paubrasilia echinata",
      familia: null,
      classe: null,
      statusConservacao: null,
    },
  ]);
  apis.regioes.listar.mockResolvedValue([
    {
      id: 10,
      nome: "Reserva de Una",
      tipoEcossistema: null,
      latitude: null,
      longitude: null,
      descricao: null,
    },
    {
      id: 11,
      nome: "Chapada Diamantina",
      tipoEcossistema: null,
      latitude: null,
      longitude: null,
      descricao: null,
    },
  ]);
});

describe("ObservacoesPage", () => {
  it("lista observações e cria usando controles legíveis de relacionamento", async () => {
    const user = userEvent.setup();
    render(<ObservacoesPage />);
    expect(await screen.findByText("Registro inicial")).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Onça-pintada (Panthera onca)" }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Data"), "2026-09-09");
    await user.selectOptions(screen.getByLabelText("Espécie"), "2");
    await user.selectOptions(screen.getByLabelText("Região"), "11");
    await user.type(screen.getByLabelText("Descrição"), "Nova observação");
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(apis.observacoes.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        data: "2026-09-09",
        especieId: 2,
        regiaoId: 11,
        descricao: "Nova observação",
      }),
    );
  });

  it("edita e exclui uma observação", async () => {
    const user = userEvent.setup();
    render(<ObservacoesPage />);
    await screen.findByText("Registro inicial");
    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.selectOptions(screen.getByLabelText("Região"), "11");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(apis.observacoes.atualizar).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ regiaoId: 11 }),
    );
    await user.click(screen.getByRole("button", { name: "Excluir" }));
    expect(apis.observacoes.excluir).toHaveBeenCalledWith(7);
  });
});

it("trata falha dos relacionamentos e impede cadastro sem espécies e regiões", async () => {
  apis.regioes.listar.mockRejectedValueOnce(new Error("Sem conexão"));
  const user = userEvent.setup();
  render(<ObservacoesPage />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Sem conexão");
  expect(screen.getByRole("button", { name: "Cadastrar" })).toBeDisabled();
  await user.click(screen.getByText("Tentar novamente"));
  expect(
    await screen.findByRole("option", { name: "Chapada Diamantina" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cadastrar" })).toBeEnabled();
});
it("pré-seleciona a espécie da ficha e desabilita upload e autoria ilustrativos", async () => {
  render(<ObservacoesPage initialSpeciesId={2} />);
  await screen.findByRole("option", {
    name: "Pau-brasil (Paubrasilia echinata)",
  });
  expect(screen.getByLabelText("Espécie")).toHaveValue("2");
  expect(screen.getByLabelText("Enviar fotografia")).toBeDisabled();
  expect(screen.getByLabelText("Observador")).toBeDisabled();
  expect(
    screen.getByText("Recurso ilustrativo — implementação pendente."),
  ).toBeInTheDocument();
  expect(apis.observacoes.criar).not.toHaveBeenCalled();
});
