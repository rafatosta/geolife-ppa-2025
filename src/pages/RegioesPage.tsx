import { useRef, useState, type FormEvent } from "react";
import { regioesApi } from "../framework/resources";
import { useCrud } from "../framework/useCrud";
import type { NovaRegiao, Regiao } from "../models/Regiao";
import { Actions, blankToNull, CrudLayout, Table } from "./CrudComponents";
const empty: NovaRegiao = {
  nome: "",
  tipoEcossistema: null,
  latitude: null,
  longitude: null,
  descricao: null,
};
const optionalNumber = (value: string) => (value === "" ? null : Number(value));
export function RegioesPage() {
  const crud = useCrud(regioesApi);
  const [editing, setEditing] = useState<Regiao | null>(null);
  const [form, setForm] = useState<NovaRegiao>(empty);
  const firstField = useRef<HTMLInputElement>(null);
  const cancel = () => {
    setEditing(null);
    setForm(empty);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.nome.trim()) return;
    const data = {
      ...form,
      nome: form.nome.trim(),
      tipoEcossistema: blankToNull(form.tipoEcossistema ?? ""),
      descricao: blankToNull(form.descricao ?? ""),
    };
    if (
      editing ? await crud.atualizar(editing.id, data) : await crud.criar(data)
    )
      cancel();
  };
  const edit = (item: Regiao) => {
    setEditing(item);
    setForm({ ...item });
    firstField.current?.focus();
  };
  return (
    <CrudLayout
      title="Regiões"
      description="Organize os locais de observação e suas coordenadas aproximadas. Campos com * são obrigatórios."
      loading={crud.loading}
      error={crud.error}
      message={crud.message}
      retry={crud.recarregar}
    >
      <form onSubmit={submit} className="panel crud-form">
        <h2>{editing ? `Editar ${editing.nome}` : "Nova região"}</h2>
        <fieldset disabled={crud.busy} className="form-grid">
          <label>
            Nome da região *
            <input
              ref={firstField}
              required
              pattern=".*\S.*"
              maxLength={100}
              aria-label="Nome da região"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </label>
          <label>
            Tipo de ecossistema
            <input
              maxLength={100}
              value={form.tipoEcossistema ?? ""}
              onChange={(e) =>
                setForm({ ...form, tipoEcossistema: e.target.value })
              }
              placeholder="Ex.: Caatinga"
            />
          </label>
          <label>
            Latitude
            <input
              type="number"
              min={-90}
              max={90}
              step="0.00000001"
              value={form.latitude ?? ""}
              onChange={(e) =>
                setForm({ ...form, latitude: optionalNumber(e.target.value) })
              }
            />
          </label>
          <label>
            Longitude
            <input
              type="number"
              min={-180}
              max={180}
              step="0.00000001"
              value={form.longitude ?? ""}
              onChange={(e) =>
                setForm({ ...form, longitude: optionalNumber(e.target.value) })
              }
            />
          </label>
          <label className="full-width">
            Descrição
            <textarea
              maxLength={500}
              rows={3}
              value={form.descricao ?? ""}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </label>
          <p className="muted full-width">
            Preencha latitude e longitude para que a região possa aparecer no
            mapa quando houver observações.
          </p>
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
      <h2>Regiões cadastradas ({crud.items.length})</h2>
      <Table
        headers={["Região", "Ecossistema", "Coordenadas", "Descrição", "Ações"]}
      >
        {crud.items.map((item) => (
          <tr key={item.id}>
            <td>
              <strong>{item.nome}</strong>
            </td>
            <td>{item.tipoEcossistema || "Não informado"}</td>
            <td>
              {item.latitude == null || item.longitude == null
                ? "Não informadas"
                : `${item.latitude}, ${item.longitude}`}
            </td>
            <td>{item.descricao || "Sem descrição"}</td>
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
        <p className="empty-state">Nenhuma região cadastrada.</p>
      )}
    </CrudLayout>
  );
}
