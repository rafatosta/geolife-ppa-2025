/**
 * ÁREA DIDÁTICA: Representa a ficha biológica de uma espécie do catálogo.
 * Uma espécie pode estar vinculada a várias observações (relacionamento 1:N).
 *
 * A interface descreve o formato dos objetos para o TypeScript.
 * Ela não cria tabelas, não executa SQL e não valida valores durante a execução.
 * As propriedades com "| null" continuam fazendo parte do objeto:
 * null representa um campo opcional sem valor, diferentemente de omitir a propriedade.
 *
 * Este modelo corresponde ao JSON da API. A cópia no frontend é intencional:
 * os componentes conhecem o contrato sem importar o código do backend.
 */
export interface Especie {
    /** Identificador único gerado pelo SQLite; corresponde à coluna id_especie. */
    id: number;

    /** Nome pelo qual a espécie é conhecida, como "Mandacaru". É obrigatório. */
    nomePopular: string;

    /** Nome científico obrigatório, como "Cereus jamacaru"; deve ser único no banco. */
    nomeCientifico: string;

    /** Família taxonômica, como "Cactaceae"; null indica que não foi informada. */
    familia: string | null;

    /** Classe taxonômica, como "Mammalia"; null indica que não foi informada. */
    classe: string | null;

    /** Situação de conservação registrada como texto livre; null indica ausência de informação. */
    statusConservacao: string | null;
}

/**
 * Dados usados para criar ou atualizar o registro.
 * Omit<Especie, "id"> reaproveita os atributos da interface, retirando apenas o id.
 * Na criação, o banco gera o id; na atualização, ele é informado separadamente.
 * Os demais campos são mantidos, inclusive aqueles que aceitam null.
 */
export type NovaEspecie = Omit<Especie, "id">;
