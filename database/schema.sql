-- ÁREA DIDÁTICA
-- Estrutura SQLite equivalente ao banco catalogo definido no anexo.

PRAGMA foreign_keys = ON;

CREATE TABLE especie (
    id_especie INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_popular VARCHAR(100) NOT NULL,
    nome_cientifico VARCHAR(150) NOT NULL UNIQUE,
    familia VARCHAR(100),
    classe VARCHAR(100),
    status_conservacao VARCHAR(100)
);

CREATE TABLE regiao (
    id_regiao INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    tipo_ecossistema VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(10, 8),
    descricao VARCHAR(500)
);

CREATE TABLE observacao (
    id_observacao INTEGER PRIMARY KEY AUTOINCREMENT,
    data DATE NOT NULL,
    descricao TEXT,
    foto_url VARCHAR(255),
    id_especie INTEGER NOT NULL,
    id_regiao INTEGER NOT NULL,
    CONSTRAINT fk_observacao_especie
        FOREIGN KEY (id_especie) REFERENCES especie(id_especie),
    CONSTRAINT fk_observacao_regiao
        FOREIGN KEY (id_regiao) REFERENCES regiao(id_regiao)
);
