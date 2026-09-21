/**
 * ÁREA DIDÁTICA: Representa uma ocorrência de uma espécie em uma região e em uma data.
 * Cada observação referencia uma espécie e uma região existentes, sem duplicar suas fichas.
 *
 * A interface descreve o formato dos objetos para o TypeScript.
 * Ela não cria tabelas, não executa SQL e não valida valores durante a execução.
 * As propriedades com "| null" continuam fazendo parte do objeto:
 * null representa um campo opcional sem valor, diferentemente de omitir a propriedade.
 *
 * Este modelo corresponde ao JSON da API. A cópia no frontend é intencional:
 * os componentes conhecem o contrato sem importar o código do backend.
 */
export interface Observacao {
    /** Identificador único gerado pelo SQLite; corresponde à coluna id_observacao. */
    id: number;

    /** Data obrigatória no formato YYYY-MM-DD, como "2026-09-09"; é texto, não um objeto Date. */
    data: string;

    /** Anotações sobre a ocorrência, como comportamento ou contexto; pode ser null. */
    descricao: string | null;

    /** Endereço de uma foto da observação; não contém o arquivo da imagem. Pode ser null. */
    fotoUrl: string | null;

    /** Identificador obrigatório da espécie observada; chave estrangeira id_especie no banco. */
    especieId: number;

    /** Identificador obrigatório da região da ocorrência; chave estrangeira id_regiao no banco. */
    regiaoId: number;
}

/**
 * Dados usados para criar ou atualizar o registro.
 * Omit<Observacao, "id"> reaproveita os atributos da interface, retirando apenas o id.
 * Na criação, o banco gera o id; na atualização, ele é informado separadamente.
 * Os demais campos são mantidos, inclusive aqueles que aceitam null.
 */
export type NovaObservacao = Omit<Observacao, "id">;
