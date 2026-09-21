import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
const apis = vi.hoisted(() => ({
  especies: { listar: vi.fn() },
  regioes: { listar: vi.fn() },
  observacoes: { listar: vi.fn() },
}));
vi.mock("../../src/framework/resources", () => ({
  especiesApi: apis.especies,
  regioesApi: apis.regioes,
  observacoesApi: apis.observacoes,
}));
// O conteúdo geográfico recebido pelo adaptador é observado; a biblioteca é validada separadamente.
vi.mock("../../src/components/RegionMap", () => ({
  hasCoordinates: (r: { latitude: number | null; longitude: number | null }) =>
    r.latitude != null &&
    r.longitude != null &&
    Math.abs(r.latitude) <= 90 &&
    Math.abs(r.longitude) <= 180,
  RegionMap: ({
    regions,
    observations,
  }: {
    regions: { nome: string }[];
    observations: unknown[];
  }) => (
    <div aria-label="Mapa das regiões">
      {regions.map((r) => r.nome).join(", ")} ({observations.length})
    </div>
  ),
}));
import { CatalogoPage } from "../../src/pages/CatalogoPage";
import { EspecieDetalhePage } from "../../src/pages/EspecieDetalhePage";
import { HomePage } from "../../src/pages/HomePage";
import { MapaPage } from "../../src/pages/MapaPage";
import { SobrePage } from "../../src/pages/SobrePage";
import { Photo } from "../../src/components/AtlasUI";
const species = Array.from({ length: 11 }, (_, i) => ({
  id: i + 1,
  nomePopular: i === 0 ? "Onça-pintada" : `Espécie ${i + 1}`,
  nomeCientifico: i === 0 ? "Panthera onca" : `Species ${i + 1}`,
  familia: null,
  classe: i === 0 ? "Mammalia" : "Aves",
  statusConservacao: i === 0 ? "Quase ameaçada" : null,
}));
beforeEach(() => {
  vi.clearAllMocks();
  apis.especies.listar.mockResolvedValue(species);
  apis.regioes.listar.mockResolvedValue([
    { id: 1, nome: "Una", latitude: -15, longitude: -39 },
    { id: 2, nome: "Sem coordenadas", latitude: null, longitude: null },
  ]);
  apis.observacoes.listar.mockResolvedValue([
    {
      id: 1,
      especieId: 1,
      regiaoId: 1,
      data: "2026-01-10",
      descricao: "Primeiro registro",
      fotoUrl: null,
    },
    {
      id: 2,
      especieId: 2,
      regiaoId: 2,
      data: "2026-02-12",
      descricao: null,
      fotoUrl: null,
    },
  ]);
});
describe("Atlas integrado", () => {
  it("busca nomes sem acentos, pagina resultados e abre a ficha correta", async () => {
    const user = userEvent.setup();
    render(<CatalogoPage />);
    await screen.findByText("11 espécies encontradas");
    expect(screen.getAllByText("Ver ficha →")).toHaveLength(9);
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(screen.getAllByText("Ver ficha →")).toHaveLength(2);
    await user.type(screen.getByLabelText("Buscar espécie"), "onca");
    expect(screen.getByText("1 espécie encontrada")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Onça-pintada/ })).toHaveAttribute(
      "href",
      "#/especies/1",
    );
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Buscar espécie"));
    await user.type(screen.getByLabelText("Buscar espécie"), "PANTHERA");
    expect(screen.getByText("1 espécie encontrada")).toBeInTheDocument();
  });
  it("combina classe, conservação e região pelas observações", async () => {
    const user = userEvent.setup();
    render(<CatalogoPage />);
    await screen.findByText("11 espécies encontradas");
    await user.selectOptions(screen.getByLabelText("Classe"), "Mammalia");
    await user.selectOptions(
      screen.getByLabelText("Conservação"),
      "Quase ameaçada",
    );
    await user.selectOptions(
      screen.getByLabelText("Região de observação"),
      "2",
    );
    expect(screen.getByText(/Nenhuma espécie corresponde/)).toBeInTheDocument();
    await user.click(screen.getByText("Limpar filtros"));
    expect(screen.getByText("11 espécies encontradas")).toBeInTheDocument();
  });
  it("exibe somente as observações da ficha escolhida e pré-seleciona a espécie no link", async () => {
    render(<EspecieDetalhePage id={1} />);
    await screen.findByRole("heading", { name: "Onça-pintada" });
    expect(screen.getByText("Primeiro registro")).toBeInTheDocument();
    expect(screen.queryByText("Sem coordenadas")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Registrar observação" }),
    ).toHaveAttribute("href", "#/cadastro?especie=1");
    expect(screen.getByText("Sem fotografia registrada")).toBeInTheDocument();
  });
  it("informa quando a espécie da URL não existe", async () => {
    render(<EspecieDetalhePage id={999} />);
    expect(
      await screen.findByRole("heading", { name: "Espécie não encontrada" }),
    ).toBeInTheDocument();
  });
  it("calcula indicadores da página inicial usando a API", async () => {
    render(<HomePage />);
    const stats = await screen.findByRole("region", {
      name: "Totais do catálogo",
    });
    expect(within(stats).getByText("11")).toBeInTheDocument();
    expect(within(stats).getAllByText("2")).toHaveLength(2);
  });
  it("informa falha de conexão e permite recuperar sem dados fictícios", async () => {
    apis.especies.listar.mockRejectedValueOnce(new Error("Sem conexão"));
    const user = userEvent.setup();
    render(<CatalogoPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Sem conexão");
    expect(screen.queryByText("Onça-pintada")).not.toBeInTheDocument();
    await user.click(screen.getByText("Tentar novamente"));
    expect(
      await screen.findByText("11 espécies encontradas"),
    ).toBeInTheDocument();
  });
  it("filtra o mapa, informa localização regional e mantém camadas ilustrativas desabilitadas", async () => {
    const user = userEvent.setup();
    render(<MapaPage />);
    await screen.findByLabelText("Mapa das regiões");
    expect(
      screen.getByText(/1 observações sem coordenadas/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/não representam o ponto exato/),
    ).toBeInTheDocument();
    for (const checkbox of screen.getAllByRole("checkbox"))
      expect(checkbox).toBeDisabled();
    await user.selectOptions(screen.getByLabelText("Espécie"), "1");
    expect(screen.getByLabelText("Mapa das regiões")).toHaveTextContent(
      "Una (1)",
    );
    expect(
      screen.queryByRole("heading", { name: "Sem coordenadas" }),
    ).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Região"), "2");
    expect(
      screen.getByText(/Nenhuma região com coordenadas/),
    ).toBeInTheDocument();
  });
  it("mostra contato e redes ilustrativos sem consultar API ou permitir ações", async () => {
    render(<SobrePage />);
    expect(
      screen.getByText("Recurso ilustrativo — implementação pendente."),
    ).toBeInTheDocument();
    for (const field of screen.getAllByRole("textbox"))
      expect(field).toBeDisabled();
    for (const button of screen.getAllByRole("button"))
      expect(button).toBeDisabled();
    expect(apis.especies.listar).not.toHaveBeenCalled();
    expect(apis.regioes.listar).not.toHaveBeenCalled();
    expect(apis.observacoes.listar).not.toHaveBeenCalled();
  });
  it("trata falha de imagem e recusa protocolos não HTTP", async () => {
    const { rerender } = render(
      <Photo url="https://example.test/foto.jpg" name="Onça" />,
    );
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("Imagem indisponível")).toBeInTheDocument();
    rerender(<Photo url="javascript:alert(1)" name="Onça" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    rerender(<Photo url="https://example.test/outra.jpg" name="Onça" />);
    await waitFor(() =>
      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        "https://example.test/outra.jpg",
      ),
    );
  });
});
