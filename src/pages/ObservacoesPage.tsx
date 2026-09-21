/** Observações referenciam fichas e regiões existentes; nunca criam espécies implicitamente. */
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  especiesApi,
  observacoesApi,
  regioesApi,
} from "../framework/resources";
import { useCrud } from "../framework/useCrud";
import type { Especie } from "../models/Especie";
import type { NovaObservacao, Observacao } from "../models/Observacao";
import type { Regiao } from "../models/Regiao";
import { Actions, blankToNull, CrudLayout, Table } from "./CrudComponents";
import { IllustrationNotice, Photo } from "../components/AtlasUI";
const empty: NovaObservacao = {
  data: "",
  descricao: null,
  fotoUrl: null,
  especieId: 0,
  regiaoId: 0,
};
export function ObservacoesPage({
  initialSpeciesId,
}: {
  initialSpeciesId?: number;
}) {
  const crud = useCrud(observacoesApi);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [relationsError, setRelationsError] = useState<string | null>(null);
  const [relationsLoading, setRelationsLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState<Observacao | null>(null);
  const [form, setForm] = useState<NovaObservacao>({
    ...empty,
    especieId: initialSpeciesId || 0,
  });
  const [filter, setFilter] = useState("");
  const firstField = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let active = true;
    setRelationsLoading(true);
    setRelationsError(null);
    void Promise.all([especiesApi.listar(), regioesApi.listar()])
      .then(([species, regions]) => {
        if (!active) return;
        setEspecies(species);
        setRegioes(regions);
        setForm((current) => ({
          ...current,
          especieId: species.some((s) => s.id === current.especieId)
            ? current.especieId
            : species[0]?.id || 0,
          regiaoId: regions.some((r) => r.id === current.regiaoId)
            ? current.regiaoId
            : regions[0]?.id || 0,
        }));
      })
      .catch((err: unknown) => {
        if (active)
          setRelationsError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar espécies e regiões.",
          );
      })
      .finally(() => {
        if (active) setRelationsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  const cancel = () => {
    setEditing(null);
    setForm({
      ...empty,
      especieId: especies.some((s) => s.id === initialSpeciesId)
        ? initialSpeciesId!
        : especies[0]?.id || 0,
      regiaoId: regioes[0]?.id || 0,
    });
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.especieId || !form.regiaoId || relationsError || relationsLoading)
      return;
    const data = {
      ...form,
      descricao: blankToNull(form.descricao ?? ""),
      fotoUrl: blankToNull(form.fotoUrl ?? ""),
    };
    if (
      editing ? await crud.atualizar(editing.id, data) : await crud.criar(data)
    )
      cancel();
  };
  const edit = (item: Observacao) => {
    setEditing(item);
    setForm({ ...item });
    firstField.current?.focus();
  };
  const visible = crud.items.filter(
    (o) => !filter || o.especieId === Number(filter),
  );
  return (
    <CrudLayout
      title="Observações"
      description="Registre uma ocorrência de uma espécie já cadastrada. Campos com * são obrigatórios."
      loading={crud.loading}
      error={crud.error}
      message={crud.message}
      retry={crud.recarregar}
    >
      {relationsError && (
        <div className="error-box" role="alert">
          <p>Não foi possível carregar os relacionamentos: {relationsError}</p>
          <button onClick={() => setRevision((v) => v + 1)}>
            Tentar novamente
          </button>
        </div>
      )}
      {!relationsLoading &&
        !relationsError &&
        (!especies.length || !regioes.length) && (
          <p className="info-note">
            Para registrar observações, cadastre primeiro uma{" "}
            <a className="text-link" href="#/gerenciar-especies">
              espécie
            </a>{" "}
            e uma{" "}
            <a className="text-link" href="#/regioes">
              região
            </a>
            .
          </p>
        )}
      <form onSubmit={submit} className="panel crud-form">
        <h2>{editing ? "Editar observação" : "Registrar observação"}</h2>
        {relationsLoading && (
          <p role="status">Carregando espécies e regiões…</p>
        )}
        <fieldset
          disabled={
            crud.busy ||
            relationsLoading ||
            !!relationsError ||
            !especies.length ||
            !regioes.length
          }
          className="form-grid"
        >
          <label>
            Data *
            <input
              ref={firstField}
              required
              type="date"
              aria-label="Data"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
            />
          </label>
          <label>
            Espécie *
            <select
              required
              aria-label="Espécie"
              value={form.especieId || ""}
              onChange={(e) =>
                setForm({ ...form, especieId: Number(e.target.value) })
              }
            >
              <option value="" disabled>
                Selecione a espécie
              </option>
              {especies.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nomePopular} ({item.nomeCientifico})
                </option>
              ))}
            </select>
          </label>
          <label>
            Região *
            <select
              required
              aria-label="Região"
              value={form.regiaoId || ""}
              onChange={(e) =>
                setForm({ ...form, regiaoId: Number(e.target.value) })
              }
            >
              <option value="" disabled>
                Selecione a região
              </option>
              {regioes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            URL da foto
            <input
              type="url"
              pattern="https?://.+"
              maxLength={255}
              aria-describedby="photo-help"
              value={form.fotoUrl ?? ""}
              onChange={(e) => setForm({ ...form, fotoUrl: e.target.value })}
              placeholder="https://…"
            />
          </label>
          <p id="photo-help" className="muted full-width">
            Informe um endereço HTTP ou HTTPS de uma imagem já disponível. A
            foto será vinculada a esta observação.
          </p>
          <label className="full-width">
            Descrição
            <textarea
              rows={3}
              value={form.descricao ?? ""}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Características observadas, comportamento ou contexto do registro…"
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
      <section className="illustrative-section">
        <h2>Fotografias e autoria</h2>
        <IllustrationNotice />
        <p>
          Upload de arquivos e identificação do observador ainda não estão
          disponíveis. Para uma foto já hospedada, use o campo URL da foto
          acima.
        </p>
        <fieldset disabled className="form-grid">
          <label>
            Enviar fotografia
            <input type="file" accept="image/*" />
          </label>
          <label>
            Observador
            <input placeholder="Nome do observador" />
          </label>
        </fieldset>
      </section>
      <section className="section">
        <div className="section-heading">
          <h2>Observações registradas</h2>
          <label>
            Filtrar observações por espécie
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">Todas as espécies</option>
              {especies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomePopular}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Table
          headers={["Data", "Espécie", "Região", "Descrição", "Foto", "Ações"]}
        >
          {visible.map((item) => (
            <tr key={item.id}>
              <td>{item.data.split("-").reverse().join("/")}</td>
              <td>
                <a className="text-link" href={`#/especies/${item.especieId}`}>
                  {especies.find((s) => s.id === item.especieId)?.nomePopular ||
                    "Nome indisponível"}
                </a>
              </td>
              <td>
                {regioes.find((r) => r.id === item.regiaoId)?.nome ||
                  "Nome indisponível"}
              </td>
              <td>{item.descricao || "Sem descrição"}</td>
              <td>
                {item.fotoUrl ? (
                  <div className="table-photo">
                    <Photo
                      url={item.fotoUrl}
                      name={
                        especies.find((s) => s.id === item.especieId)
                          ?.nomePopular || "espécie"
                      }
                    />
                  </div>
                ) : (
                  "Sem foto"
                )}
              </td>
              <td>
                <Actions
                  disabled={crud.busy || relationsLoading || !!relationsError}
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
        {!visible.length && (
          <p className="empty-state">Nenhuma observação encontrada.</p>
        )}
      </section>
    </CrudLayout>
  );
}
