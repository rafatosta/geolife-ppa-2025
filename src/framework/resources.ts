/** INFRAESTRUTURA: clientes CRUD prontos para os recursos do catálogo. */
import type { Especie, NovaEspecie } from "../models/Especie";
import type { NovaObservacao, Observacao } from "../models/Observacao";
import type { NovaRegiao, Regiao } from "../models/Regiao";
import { createCrudApi } from "./api";

export const especiesApi = createCrudApi<Especie, NovaEspecie>("especies");
export const regioesApi = createCrudApi<Regiao, NovaRegiao>("regioes");
export const observacoesApi = createCrudApi<Observacao, NovaObservacao>("observacoes");
