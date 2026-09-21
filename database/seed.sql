-- IMPLEMENTAÇÃO DE REFERÊNCIA
-- Catálogo demonstrativo: 20 espécies, 8 regiões e 48 observações fictícias.
-- Datas, avistamentos e descrições simulam campanhas de janeiro a agosto de 2026.
-- Coordenadas aproximadas representam regiões, não localizações de indivíduos.
-- Status de conservação são exemplos didáticos, sem valor de avaliação oficial.
-- Fotografias ficam NULL: não há imagens de campo fornecidas para estes registros.
-- Execute após schema.sql no SQL Editor do Supabase.

BEGIN TRANSACTION;

INSERT INTO public.especies (id, nome_popular, nome_cientifico, familia, classe, status_conservacao) VALUES
    (1, 'Onça-pintada', 'Panthera onca', 'Felidae', 'Mammalia', 'Quase ameaçada'),
    (2, 'Mico-leão-da-cara-dourada', 'Leontopithecus chrysomelas', 'Callitrichidae', 'Mammalia', 'Em perigo'),
    (3, 'Pau-brasil', 'Paubrasilia echinata', 'Fabaceae', 'Magnoliopsida', 'Em perigo'),
    (4, 'Capivara', 'Hydrochoerus hydrochaeris', 'Caviidae', 'Mammalia', 'Pouco preocupante'),
    (5, 'Tamanduá-mirim', 'Tamandua tetradactyla', 'Myrmecophagidae', 'Mammalia', 'Pouco preocupante'),
    (6, 'Cachorro-do-mato', 'Cerdocyon thous', 'Canidae', 'Mammalia', 'Pouco preocupante'),
    (7, 'Tucano-de-bico-preto', 'Ramphastos vitellinus', 'Ramphastidae', 'Aves', NULL),
    (8, 'Garça-branca-grande', 'Ardea alba', 'Ardeidae', 'Aves', 'Pouco preocupante'),
    (9, 'Bem-te-vi', 'Pitangus sulphuratus', 'Tyrannidae', 'Aves', 'Pouco preocupante'),
    (10, 'Asa-branca', 'Patagioenas picazuro', 'Columbidae', 'Aves', 'Pouco preocupante'),
    (11, 'Teiú', 'Salvator merianae', 'Teiidae', 'Reptilia', 'Pouco preocupante'),
    (12, 'Iguana-verde', 'Iguana iguana', 'Iguanidae', 'Reptilia', 'Pouco preocupante'),
    (13, 'Tartaruga-verde', 'Chelonia mydas', 'Cheloniidae', 'Reptilia', NULL),
    (14, 'Mandacaru', 'Cereus jamacaru', 'Cactaceae', 'Magnoliopsida', NULL),
    (15, 'Umbuzeiro', 'Spondias tuberosa', 'Anacardiaceae', 'Magnoliopsida', NULL),
    (16, 'Mangue-vermelho', 'Rhizophora mangle', 'Rhizophoraceae', 'Magnoliopsida', NULL),
    (17, 'Bromélia', 'Aechmea blanchetiana', 'Bromeliaceae', 'Liliopsida', NULL),
    (18, 'Jatobá', 'Hymenaea courbaril', 'Fabaceae', 'Magnoliopsida', NULL),
    (19, 'Preguiça-comum', 'Bradypus variegatus', 'Bradypodidae', 'Mammalia', 'Pouco preocupante'),
    (20, 'Sabiá-laranjeira', 'Turdus rufiventris', 'Turdidae', 'Aves', 'Pouco preocupante');

INSERT INTO public.regioes (id, nome, tipo_ecossistema, latitude, longitude, descricao) VALUES
    (1, 'Reserva de Una', 'Mata Atlântica', -15.18333333, -39.05, 'Setor demonstrativo de floresta úmida com trilhas de inventário e pontos de monitoramento de fauna.'),
    (2, 'Chapada Diamantina', 'Cerrado e Caatinga', -12.86666667, -41.38333333, 'Setor demonstrativo de serras, campos rupestres e vegetação de transição.'),
    (3, 'Costa do Descobrimento', 'Mata Atlântica', -16.44347222, -39.06416667, 'Setor demonstrativo com fragmentos florestais, restinga e vegetação costeira.'),
    (4, 'Litoral de Praia do Forte', 'Ambiente marinho e restinga', -12.575, -38.005, 'Setor demonstrativo para observações costeiras em praias e piscinas naturais.'),
    (5, 'Manguezal de Maragogipe', 'Manguezal', -12.777, -38.918, 'Setor demonstrativo de canais de maré e bancos de lama para acompanhamento de aves e vegetação.'),
    (6, 'Raso da Catarina', 'Caatinga', -9.667, -38.5, 'Setor demonstrativo de caatinga arbustiva, solo arenoso e áreas abertas.'),
    (7, 'Serra do Conduru', 'Mata Atlântica', -14.48333333, -39.1, 'Setor demonstrativo de floresta com árvores de grande porte e cursos de água.'),
    (8, 'Lagoa urbana de Salvador', 'Lagoa e vegetação urbana', -12.945, -38.425, 'Área fictícia de acompanhamento de fauna em ambiente urbano, com margens vegetadas e trilha de visitação.');

INSERT INTO public.observacoes (data, descricao, foto_url, especie_id, regiao_id) VALUES
    ('2026-01-11', 'Grupo de cinco indivíduos deslocando-se pelo dossel ao amanhecer.', NULL, 2, 1),
    ('2026-01-12', 'Três plantas adultas inventariadas em trecho rochoso da trilha.', NULL, 14, 2),
    ('2026-01-13', 'Árvore adulta identificada durante inventário do fragmento florestal.', NULL, 3, 3),
    ('2026-01-14', 'Juvenil avistado em piscina natural durante observação a partir da margem.', NULL, 13, 4),
    ('2026-01-15', 'Parcela com árvores adultas e raízes expostas durante a maré baixa.', NULL, 16, 5),
    ('2026-01-16', 'Plantas adultas registradas ao longo de transecto em solo arenoso.', NULL, 14, 6),
    ('2026-01-17', 'Árvore de grande porte inventariada junto ao curso de água.', NULL, 18, 7),
    ('2026-01-18', 'Grupo de quatro indivíduos alimentando-se na margem vegetada.', NULL, 4, 8),
    ('2026-02-11', 'Indivíduo registrado por armadilha fotográfica durante a madrugada.', NULL, 1, 1),
    ('2026-02-12', 'Árvore com frutos observada junto à borda do caminho.', NULL, 15, 2),
    ('2026-02-13', 'Agrupamento de bromélias com inflorescências na borda da restinga.', NULL, 17, 3),
    ('2026-02-14', 'Indivíduo alimentando-se em faixa rasa na maré baixa.', NULL, 8, 4),
    ('2026-02-15', 'Quatro indivíduos forrageando em banco de lama.', NULL, 8, 5),
    ('2026-02-16', 'Árvore marcada para acompanhamento sazonal da copa.', NULL, 15, 6),
    ('2026-02-17', 'Três indivíduos vocalizando no dossel durante percurso matinal.', NULL, 7, 7),
    ('2026-02-18', 'Indivíduo imóvel na margem rasa durante contagem matinal.', NULL, 8, 8),
    ('2026-03-11', 'Dois indivíduos alimentando-se em árvore com frutos maduros.', NULL, 7, 1),
    ('2026-03-12', 'Indivíduo atravessando área aberta no fim da tarde.', NULL, 6, 2),
    ('2026-03-13', 'Casal vocalizando sobre árvore próxima à trilha.', NULL, 9, 3),
    ('2026-03-14', 'Bromélias inventariadas em trecho de restinga próximo à passarela.', NULL, 17, 4),
    ('2026-03-15', 'Indivíduo sobre galho acima de canal de maré.', NULL, 12, 5),
    ('2026-03-16', 'Dois indivíduos registrados por câmera ao longo de estrada de terra.', NULL, 6, 6),
    ('2026-03-17', 'Indivíduo alimentando-se de folhas na copa de árvore.', NULL, 19, 7),
    ('2026-03-18', 'Casal com atividade de construção de ninho em árvore da margem.', NULL, 9, 8),
    ('2026-05-11', 'Árvore adulta marcada para acompanhamento do inventário florestal.', NULL, 18, 1),
    ('2026-05-12', 'Bando de oito aves pousado em árvores próximas ao ponto de água.', NULL, 10, 2),
    ('2026-05-13', 'Indivíduo forrageando junto a tronco caído ao entardecer.', NULL, 5, 3),
    ('2026-05-14', 'Adulto em repouso sobre galho na borda da vegetação costeira.', NULL, 12, 4),
    ('2026-05-15', 'Plântulas identificadas na borda da parcela de acompanhamento.', NULL, 16, 5),
    ('2026-05-16', 'Bando em deslocamento sobre clareira durante contagem matinal.', NULL, 10, 6),
    ('2026-05-17', 'Indivíduo escalando tronco próximo ao início da trilha.', NULL, 5, 7),
    ('2026-05-18', 'Dois indivíduos alimentando-se no gramado próximo à trilha.', NULL, 20, 8),
    ('2026-07-11', 'Grupo com filhote observado próximo ao trecho de mata ciliar.', NULL, 2, 1),
    ('2026-07-12', 'Adulto aquecendo-se sobre rocha antes de entrar na vegetação.', NULL, 11, 2),
    ('2026-07-13', 'Revisita à árvore marcada, com registro de novas brotações.', NULL, 3, 3),
    ('2026-07-14', 'Dois indivíduos avistados na superfície durante caminhada de monitoramento.', NULL, 13, 4),
    ('2026-07-15', 'Seis indivíduos observados no mesmo banco de lama em campanha de retorno.', NULL, 8, 5),
    ('2026-07-16', 'Indivíduo procurando alimento entre folhas secas.', NULL, 11, 6),
    ('2026-07-17', 'Revisita para medição e conferência da identificação da árvore.', NULL, 18, 7),
    ('2026-07-18', 'Grupo de seis indivíduos, incluindo dois filhotes, observado ao entardecer.', NULL, 4, 8),
    ('2026-08-11', 'Indivíduo em repouso na copa, identificado com auxílio de binóculos.', NULL, 19, 1),
    ('2026-08-12', 'Retorno ao ponto de inventário para acompanhamento dos botões florais.', NULL, 14, 2),
    ('2026-08-13', NULL, NULL, 20, 3),
    ('2026-08-14', 'Indivíduo vocalizando em arbusto próximo ao acesso à praia.', NULL, 9, 4),
    ('2026-08-15', 'Casal observado junto à vegetação na transição para área habitada.', NULL, 9, 5),
    ('2026-08-16', 'Retorno à árvore marcada com registro de perda parcial de folhas.', NULL, 15, 6),
    ('2026-08-17', 'Indivíduo forrageando na serrapilheira após chuva leve.', NULL, 20, 7),
    ('2026-08-18', NULL, NULL, 11, 8);

SELECT setval(pg_get_serial_sequence('public.especies', 'id'), (SELECT max(id) FROM public.especies));
SELECT setval(pg_get_serial_sequence('public.regioes', 'id'), (SELECT max(id) FROM public.regioes));

COMMIT;
