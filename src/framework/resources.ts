/** INFRAESTRUTURA: clientes CRUD e mapeamento entre TypeScript e PostgreSQL. */
import type { Especie, NovaEspecie } from "../models/Especie";
import type { NovaObservacao, Observacao } from "../models/Observacao";
import type { NovaRegiao, Regiao } from "../models/Regiao";
import { createCrudApi } from "./api";

type EspecieRow = {
  id: number;
  nome_popular: string;
  nome_cientifico: string;
  familia: string | null;
  classe: string | null;
  status_conservacao: string | null;
};
type RegiaoRow = {
  id: number;
  nome: string;
  tipo_ecossistema: string | null;
  latitude: number | null;
  longitude: number | null;
  descricao: string | null;
};
type ObservacaoRow = {
  id: number;
  data: string;
  descricao: string | null;
  foto_url: string | null;
  especie_id: number;
  regiao_id: number;
};

export const especiesApi = createCrudApi<Especie, NovaEspecie, EspecieRow>({
  table: "especies",
  idColumn: "id",
  fromRow: (row) => ({
    id: row.id,
    nomePopular: row.nome_popular,
    nomeCientifico: row.nome_cientifico,
    familia: row.familia,
    classe: row.classe,
    statusConservacao: row.status_conservacao,
  }),
  toRow: (data) => ({
    nome_popular: data.nomePopular,
    nome_cientifico: data.nomeCientifico,
    familia: data.familia,
    classe: data.classe,
    status_conservacao: data.statusConservacao,
  }),
});

export const regioesApi = createCrudApi<Regiao, NovaRegiao, RegiaoRow>({
  table: "regioes",
  idColumn: "id",
  fromRow: (row) => ({
    id: row.id,
    nome: row.nome,
    tipoEcossistema: row.tipo_ecossistema,
    latitude: row.latitude,
    longitude: row.longitude,
    descricao: row.descricao,
  }),
  toRow: (data) => ({
    nome: data.nome,
    tipo_ecossistema: data.tipoEcossistema,
    latitude: data.latitude,
    longitude: data.longitude,
    descricao: data.descricao,
  }),
});

export const observacoesApi = createCrudApi<
  Observacao,
  NovaObservacao,
  ObservacaoRow
>({
  table: "observacoes",
  idColumn: "id",
  fromRow: (row) => ({
    id: row.id,
    data: row.data,
    descricao: row.descricao,
    fotoUrl: row.foto_url,
    especieId: row.especie_id,
    regiaoId: row.regiao_id,
  }),
  toRow: (data) => ({
    data: data.data,
    descricao: data.descricao,
    foto_url: data.fotoUrl,
    especie_id: data.especieId,
    regiao_id: data.regiaoId,
  }),
});
