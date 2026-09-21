/**
 * ÁREA DIDÁTICA: Representa uma região à qual as observações de biodiversidade são associadas.
 * Uma região pode estar vinculada a várias observações (relacionamento 1:N).
 *
 * A interface descreve o formato dos objetos para o TypeScript.
 * Ela não cria tabelas, não executa SQL e não valida valores durante a execução.
 * As propriedades com "| null" continuam fazendo parte do objeto:
 * null representa um campo opcional sem valor, diferentemente de omitir a propriedade.
 * As coordenadas pertencem à região, não ao ponto exato de cada avistamento.
 *
 * Este modelo corresponde ao JSON da API. A cópia no frontend é intencional:
 * os componentes conhecem o contrato sem importar o código do backend.
 */
export interface Regiao {
    /** Identificador único gerado pelo SQLite; corresponde à coluna id_regiao. */
    id: number;

    /** Nome obrigatório da região, como "Reserva de Una". */
    nome: string;

    /** Ecossistema informado para a região, como "Caatinga"; pode ser null. */
    tipoEcossistema: string | null;

    /** Latitude em graus decimais; valores negativos indicam o sul. Pode ser null. */
    latitude: number | null;

    /** Longitude em graus decimais; valores negativos indicam o oeste. Pode ser null. */
    longitude: number | null;

    /** Descrição da região; null indica que não foi preenchida. */
    descricao: string | null;
}

/**
 * Dados usados para criar ou atualizar o registro.
 * Omit<Regiao, "id"> reaproveita os atributos da interface, retirando apenas o id.
 * Na criação, o banco gera o id; na atualização, ele é informado separadamente.
 * Os demais campos são mantidos, inclusive aqueles que aceitam null.
 */
export type NovaRegiao = Omit<Regiao, "id">;
