import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  listar: vi.fn(),
  criar: vi.fn(),
  atualizar: vi.fn(),
  excluir: vi.fn(),
  buscar: vi.fn(),
}));
vi.mock("../../src/framework/resources", () => ({ regioesApi: api }));
import { RegioesPage } from "../../src/pages/RegioesPage";

const regiao = {
  id: 1,
  nome: "Reserva de Una",
  tipoEcossistema: "Mata Atlântica",
  latitude: -15.18333333,
  longitude: -39.05,
  descricao: "Sul da Bahia",
};

beforeEach(() => {
  vi.clearAllMocks();
  api.listar.mockResolvedValue([regiao]);
  api.criar.mockImplementation(async (data) => ({ ...data, id: 2 }));
  api.atualizar.mockResolvedValue(regiao);
  api.excluir.mockResolvedValue(undefined);
});

describe("RegioesPage", () => {
  it("renderiza, cria, edita e exclui regiões", async () => {
    const user = userEvent.setup();
    render(<RegioesPage />);
    expect(await screen.findByText("Reserva de Una")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Nome da região"), "Chapada Teste");
    await user.type(screen.getByLabelText("Latitude"), "-12.5");
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(api.criar).toHaveBeenCalledWith(
      expect.objectContaining({ nome: "Chapada Teste", latitude: -12.5 }),
    );

    await user.click(
      within(screen.getByRole("row", { name: /Reserva de Una/ })).getByRole(
        "button",
        { name: "Editar" },
      ),
    );
    await user.clear(screen.getByLabelText("Descrição"));
    await user.type(screen.getByLabelText("Descrição"), "Descrição nova");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(api.atualizar).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ descricao: "Descrição nova" }),
    );
    await user.click(
      within(screen.getByRole("row", { name: /Reserva de Una/ })).getByRole(
        "button",
        { name: "Excluir" },
      ),
    );
    expect(api.excluir).toHaveBeenCalledWith(1);
  });
});
