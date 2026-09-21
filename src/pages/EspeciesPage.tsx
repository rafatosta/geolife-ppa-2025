/** CRUD da ficha biológica; observações são registradas em uma página separada. */
import { useRef, useState, type FormEvent } from "react";
import { especiesApi } from "../framework/resources";
import { useCrud } from "../framework/useCrud";
import type { Especie, NovaEspecie } from "../models/Especie";
import { Actions, blankToNull, CrudLayout, Table } from "./CrudComponents";
const empty: NovaEspecie = {
  nomePopular: "",
  nomeCientifico: "",
  familia: null,
  classe: null,
  statusConservacao: null,
};
export function EspeciesPage() {
  const crud = useCrud(especiesApi);
  const [editing, setEditing] = useState<Especie | null>(null);
  const [form, setForm] = useState<NovaEspecie>(empty);
  const firstField = useRef<HTMLInputElement>(null);
  const cancel = () => {
    setEditing(null);
    setForm(empty);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.nomePopular.trim() || !form.nomeCientifico.trim()) return;
    const data = {
      ...form,
      nomePopular: form.nomePopular.trim(),
      nomeCientifico: form.nomeCientifico.trim(),
      familia: blankToNull(form.familia ?? ""),
      classe: blankToNull(form.classe ?? ""),
      statusConservacao: blankToNull(form.statusConservacao ?? ""),
    };
    if (
      editing ? await crud.atualizar(editing.id, data) : await crud.criar(data)
    )
      cancel();
  };
  const edit = (item: Especie) => {
    setEditing(item);
    setForm({ ...item });
    firstField.current?.focus();
  };
  return (
    <CrudLayout
      title="Espécies"
      description="Cadastre e mantenha as fichas biológicas do atlas. Campos com * são obrigatórios."
      loading={crud.loading}
      error={crud.error}
      message={crud.message}
      retry={crud.recarregar}
    >
      <form onSubmit={submit} className="panel crud-form">
        <h2>{editing ? `Editar ${editing.nomePopular}` : "Nova espécie"}</h2>
        <fieldset disabled={crud.busy} className="form-grid">
          <label>
            Nome popular *
            <input
              ref={firstField}
              required
              pattern=".*\S.*"
              maxLength={100}
              aria-label="Nome popular"
              value={form.nomePopular}
              onChange={(e) =>
                setForm({ ...form, nomePopular: e.target.value })
              }
              placeholder="Ex.: Mandacaru"
            />
          </label>
          <label>
            Nome científico *
            <input
              required
              pattern=".*\S.*"
              maxLength={150}
              aria-label="Nome científico"
              value={form.nomeCientifico}
              onChange={(e) =>
                setForm({ ...form, nomeCientifico: e.target.value })
              }
              placeholder="Ex.: Cereus jamacaru"
            />
          </label>
          <label>
            Família
            <input
              maxLength={100}
              value={form.familia ?? ""}
              onChange={(e) => setForm({ ...form, familia: e.target.value })}
            />
          </label>
          <label>
            Classe
            <input
              maxLength={100}
              value={form.classe ?? ""}
              onChange={(e) => setForm({ ...form, classe: e.target.value })}
            />
          </label>
          <label>
            Status de conservação
            <input
              maxLength={100}
              value={form.statusConservacao ?? ""}
              onChange={(e) =>
                setForm({ ...form, statusConservacao: e.target.value })
              }
            />
          </label>
          <div className="form-actions">
            {editing && (
              <button
                className="button secondary"
                type="button"
                onClick={cancel}
              >
                Cancelar edição
              </button>
            )}
            <button className="button">
              {crud.busy ? "Salvando…" : editing ? "Salvar" : "Cadastrar"}
            </button>
          </div>
        </fieldset>
      </form>
      <h2>Espécies cadastradas ({crud.items.length})</h2>
      <Table headers={["Nome", "Classificação", "Conservação", "Ações"]}>
        {crud.items.map((item) => (
          <tr key={item.id}>
            <td>
              <a className="text-link" href={`#/especies/${item.id}`}>
                {item.nomePopular}
              </a>
              <div className="scientific">{item.nomeCientifico}</div>
            </td>
            <td>
              {[item.familia, item.classe].filter(Boolean).join(" · ") ||
                "Não informada"}
            </td>
            <td>{item.statusConservacao || "Não informado"}</td>
            <td>
              <Actions
                disabled={crud.busy}
                onEdit={() => edit(item)}
                onDelete={() => {
                  void crud.excluir(item.id).then((ok) => {
                    if (ok && editing?.id === item.id) cancel();
                  });
                }}
              />
            </td>
          </tr>
        ))}
      </Table>
      {!crud.items.length && (
        <p className="empty-state">Nenhuma espécie cadastrada.</p>
      )}
    </CrudLayout>
  );
}
